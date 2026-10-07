#!/usr/bin/env python3
"""Revisión automática de los artefactos de estudio.

Uso (desde la raíz del repo):
    python3 -I Explicaciones/_compartido/revisar.py                 # todos los 0X_*.html
    python3 -I Explicaciones/_compartido/revisar.py 02_redes_neuronales.html
    python3 -I Explicaciones/_compartido/revisar.py --render 02_redes_neuronales.html

--render abre la página en Chrome sin interfaz y reporta errores de JavaScript.
Sale con código 1 si hay ERRORES; las ADVERTENCIAS no bloquean.
"""
import os
import re
import subprocess
import sys
import tempfile

AQUI = os.path.dirname(os.path.abspath(__file__))
EXPL = os.path.dirname(AQUI)
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

LATEX = re.compile(r"\\(frac|sum|prod|phi|theta|alpha|beta|gamma|lambda|sigma|omega|Omega|mathbf|mathcal|"
                   r"mathbb|hat|tilde|partial|nabla|left|right|begin|end|cdot|sqrt|ldots|cdots|times|leq|geq|"
                   r"infty|log|exp|arg|min|max|boxed|text|odot)\b")
DOLAR = re.compile(r"\$[^$\n<>]{1,80}\$")
REQUERIDOS = ["inicio", "mapa", "practica", "glosario"]


def claves_notacion():
    with open(os.path.join(AQUI, "notacion.js"), encoding="utf-8") as f:
        return set(re.findall(r"^\s*(\w+)\s*:\s*\{s:", f.read(), re.M))


def ids_de(html):
    return set(re.findall(r'\bid="([^"]+)"', html))


def sin_bloques(html):
    html = re.sub(r"<script\b[^>]*>.*?</script>", " ", html, flags=re.S | re.I)
    html = re.sub(r"<style\b[^>]*>.*?</style>", " ", html, flags=re.S | re.I)
    html = re.sub(r"<code\b[^>]*>.*?</code>", " ", html, flags=re.S | re.I)
    return html


def revisar(nombre, render, notac):
    ruta = os.path.join(EXPL, nombre)
    errores, avisos = [], []
    with open(ruta, encoding="utf-8") as f:
        html = f.read()
    es_00 = nombre.startswith("00_")
    es_plantilla = nombre == "plantilla.html"

    # 1. recursos compartidos, en orden
    i_css = html.find("_compartido/estilos.css")
    i_not = html.find("_compartido/notacion.js")
    i_com = html.find("_compartido/componentes.js")
    if i_css < 0:
        errores.append("no enlaza _compartido/estilos.css")
    if i_not < 0 or i_com < 0:
        errores.append("no carga _compartido/notacion.js y _compartido/componentes.js")
    elif i_not > i_com:
        errores.append("notacion.js debe cargarse ANTES que componentes.js")

    # 2. LaTeX fuera de scripts y código
    texto = sin_bloques(html)
    for m in LATEX.finditer(texto):
        errores.append("LaTeX encontrado: …%s…" % texto[max(0, m.start() - 25):m.end() + 15].replace("\n", " "))
        if len(errores) > 12:
            break
    for m in DOLAR.finditer(texto):
        avisos.append("posible fórmula entre $…$: %s" % m.group(0))

    # 3. símbolos con entrada en notacion.js
    for k in sorted(set(re.findall(r'data-s="([^"]+)"', html))):
        if k not in notac:
            errores.append('data-s="%s" no existe en notacion.js (repórtalo al orquestador)' % k)

    # 4. ids obligatorios y navegación de la serie
    ids = ids_de(html)
    for r in REQUERIDOS + (["notacion"] if es_00 else []):
        if r not in ids:
            errores.append('falta la sección obligatoria id="%s"' % r)
    m = re.search(r'<nav class="serie" data-actual="(\d\d)"', html)
    if not m:
        errores.append('falta <nav class="serie" data-actual="XX">')
    elif not es_plantilla and not nombre.startswith(m.group(1) + "_"):
        errores.append("nav.serie data-actual=%s no coincide con el nombre del archivo" % m.group(1))
    if 'id="toc"' not in html:
        errores.append('falta <nav id="toc" data-auto>')

    # 5. enlaces internos y entre artefactos
    ids_dinamicos = {"sym-" + k for k in notac} if es_00 else set()
    for ref in sorted(set(re.findall(r'href="#([^"]+)"', html))):
        if ref not in ids and ref not in ids_dinamicos:
            errores.append("enlace interno roto: #%s" % ref)
    for arch, ancla in sorted(set(re.findall(r'href="(0\d_[\w]+\.html)(?:#([^"]+))?"', html))):
        destino = os.path.join(EXPL, arch)
        if not os.path.exists(destino):
            avisos.append("enlace a %s, que todavía no existe" % arch)
            continue
        if ancla:
            with open(destino, encoding="utf-8") as f:
                otros = ids_de(f.read())
            if arch.startswith("00_"):
                otros |= {"sym-" + k for k in notac}
            if ancla not in otros:
                errores.append("enlace roto: %s#%s" % (arch, ancla))

    # 6. sin recursos externos
    for m in re.finditer(r'<(script|link|img)\b[^>]*(src|href)="(https?:)?//', html, re.I):
        errores.append("recurso externo no permitido: %s" % html[m.start():m.start() + 90])

    # 7. estructura pedagógica
    n_form = len(re.findall(r'class="formula"', html))
    n_lect = len(re.findall(r'class="f-lectura"', html))
    if n_lect < n_form:
        errores.append("%d bloques .formula pero solo %d con .f-lectura (toda fórmula se traduce)" % (n_form, n_lect))
    n_ej = len(re.findall(r'class="ejercicio"', html))
    n_resp = len(re.findall(r'class="respuesta"', html))
    if not es_plantilla:
        if n_ej < 6:
            errores.append("solo %d ejercicios de práctica (mínimo 6)" % n_ej)
        if n_resp < n_ej:
            errores.append("%d ejercicios pero %d respuestas" % (n_ej, n_resp))
        if n_form < 3 and not es_00:
            avisos.append("solo %d bloques .formula" % n_form)
        if len(re.findall(r'class="widget', html)) < 3:
            avisos.append("menos de 3 laboratorios (.widget)")

    # 8. tamaño y estilos propios
    kb = len(html.encode("utf-8")) / 1024
    if kb > 300:
        avisos.append("archivo grande: %.0f KB" % kb)
    estilos_propios = sum(b.count("\n") for b in re.findall(r"<style\b[^>]*>(.*?)</style>", html, re.S))
    if estilos_propios > 150:
        avisos.append("%d líneas de CSS propio: ¿se está copiando estilos.css?" % estilos_propios)

    # 9. sintaxis de los scripts propios
    for j, bloque in enumerate(re.findall(r"<script>(.*?)</script>", html, re.S)):
        with tempfile.NamedTemporaryFile("w", suffix=".js", delete=False, encoding="utf-8") as t:
            t.write(bloque)
        r = subprocess.run(["node", "--check", t.name], capture_output=True, text=True)
        os.unlink(t.name)
        if r.returncode != 0:
            errores.append("error de sintaxis JS en <script> #%d:\n%s" % (j + 1, r.stderr.strip()[:600]))

    # 9b. anidamiento: una etiqueta mal cerrada saca el contenido de .wrap (pasa a ancho completo)
    from html.parser import HTMLParser
    VACIAS = {"br", "img", "input", "meta", "link", "hr", "source", "wbr", "area", "col", "embed", "param", "track"}

    class Anid(HTMLParser):
        def __init__(self):
            super().__init__()
            self.pila, self.malos = [], []

        def handle_starttag(self, t, a):
            if t not in VACIAS:
                self.pila.append((t, self.getpos()[0]))

        def handle_endtag(self, t):
            if t in VACIAS:
                return
            if not self.pila:
                self.malos.append("</%s> sin apertura (línea %d)" % (t, self.getpos()[0]))
                return
            if self.pila[-1][0] != t:
                self.malos.append("</%s> en la línea %d cierra un <%s> abierto en la línea %d" % (t, self.getpos()[0], self.pila[-1][0], self.pila[-1][1]))
            self.pila.pop()

    an = Anid()
    an.feed(re.sub(r"<script\b.*?</script>", lambda m: "\n" * m.group(0).count("\n"), html, flags=re.S))
    for mal in an.malos[:5]:
        errores.append("anidamiento HTML: " + mal)

    # 10. render real (opcional)
    if render and os.path.exists(CHROME):
        r = subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--enable-logging=stderr", "--v=0",
                            "--virtual-time-budget=4000", "--dump-dom", "file://" + ruta],
                           capture_output=True, text=True, timeout=90)
        for linea in r.stderr.splitlines():
            if "CONSOLE" in linea and ("Uncaught" in linea or "Error" in linea or "[DL]" in linea):
                errores.append("consola: " + linea.split("CONSOLE", 1)[1][:300])
        dom = r.stdout
        if 'data-auto=""><p class="toc-title">' not in dom:
            errores.append("el índice no se generó: probablemente componentes.js falló al cargar")

    return kb, errores, avisos


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    render = "--render" in sys.argv
    if not args:
        args = sorted(f for f in os.listdir(EXPL) if re.match(r"0\d_.*\.html$", f))
    notac = claves_notacion()
    total_err = 0
    for nombre in args:
        nombre = os.path.basename(nombre)
        kb, err, av = revisar(nombre, render, notac)
        estado = "OK" if not err else "%d ERRORES" % len(err)
        print("\n== %s (%.0f KB) · %s" % (nombre, kb, estado))
        for e in err:
            print("  ERROR  " + e)
        for a in av:
            print("  aviso  " + a)
        total_err += len(err)
    sys.exit(1 if total_err else 0)


if __name__ == "__main__":
    main()
