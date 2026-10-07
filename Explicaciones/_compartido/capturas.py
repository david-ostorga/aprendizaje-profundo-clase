#!/usr/bin/env python3
"""Una captura por sección (h2) de un artefacto, en tema claro u oscuro.

Uso (desde la raíz del repo):
    python3 -I Explicaciones/_compartido/capturas.py 02_redes_neuronales.html /ruta/salida [--oscuro]

Genera /ruta/salida/<archivo>_<id-de-sección>.png (ancho 760 px, alto máximo 2400 px
por imagen; las secciones más largas se parten en _a, _b…). Revisa TODAS con Read.
"""
import os
import re
import subprocess
import sys

from PIL import Image

AQUI = os.path.dirname(os.path.abspath(__file__))
EXPL = os.path.dirname(AQUI)
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
ANCHO, ALTO_MAX = 1300, 2400


def chrome(args):
    return subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--hide-scrollbars"] + args,
                          capture_output=True, text=True, timeout=120)


def main():
    nombre, salida = os.path.basename(sys.argv[1]), sys.argv[2]
    esquema = "0" if "--oscuro" in sys.argv else "1"
    os.makedirs(salida, exist_ok=True)
    with open(os.path.join(EXPL, nombre), encoding="utf-8") as f:
        html = f.read()

    sonda = ('<script>setTimeout(function(){var o=[];document.querySelectorAll("main h2[id]").forEach(function(h){'
             'o.push(h.id+":"+Math.round(h.getBoundingClientRect().top+scrollY));});'
             'console.log("POS|"+o.join(",")+"|"+document.body.scrollHeight);},2000);</script></body>')
    tmp = os.path.join(EXPL, "_tmp_capturas.html")
    try:
        with open(tmp, "w", encoding="utf-8") as f:
            f.write(html.replace("</body>", sonda))
        r = chrome(["--window-size=%d,900" % ANCHO, "--enable-logging=stderr", "--v=0",
                    "--virtual-time-budget=5000", "--dump-dom", "file://" + tmp])
        m = re.search(r"POS\|([^|]*)\|(\d+)", r.stderr)
        if not m:
            sys.exit("No pude leer las posiciones de las secciones (¿falló el JS?).")
        secciones = [(s.split(":")[0], int(s.split(":")[1])) for s in m.group(1).split(",") if s]
        total = int(m.group(2))
        cortes = [(0, "inicio")] + [(y, i) for i, y in secciones]
        hechas = []
        for k, (y0, ident) in enumerate(cortes):
            y1 = cortes[k + 1][0] if k + 1 < len(cortes) else total
            partes = max(1, -(-(y1 - y0) // ALTO_MAX))
            for p in range(partes):
                ya = y0 + p * ALTO_MAX
                alto = min(ALTO_MAX, y1 - ya)
                estilo = "<style>.shell{margin-top:-%dpx}</style></head>" % max(0, ya - 60)
                with open(tmp, "w", encoding="utf-8") as f:
                    f.write(html.replace("</head>", estilo))
                png = os.path.join(salida, "%s_%s%s.png" % (nombre[:-5], ident, "" if partes == 1 else "_" + "abcdefgh"[p]))
                chrome(["--blink-settings=preferredColorScheme=" + esquema,
                        "--window-size=%d,%d" % (ANCHO, alto + 60), "--virtual-time-budget=5000",
                        "--screenshot=" + png, "file://" + tmp])
                im = Image.open(png).crop((280, 0, ANCHO, alto + 60))
                im.resize((760, int((alto + 60) * 760 / (ANCHO - 280)))).save(png)
                hechas.append(png)
    finally:
        if os.path.exists(tmp):
            os.remove(tmp)
    print("\n".join(hechas))


if __name__ == "__main__":
    main()
