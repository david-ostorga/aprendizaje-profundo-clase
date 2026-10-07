# Guía de estilo · Artefactos de estudio de Aprendizaje Profundo

Contrato para cualquier agente que construya un artefacto de esta serie. Léelo completo antes de escribir.

## 1. Para quién escribes

Un estudiante de maestría que **entiende bien los conceptos y aprende por intuición y ejemplos**, pero que pasó años sin leer matemáticas: la notación, las fórmulas y las derivaciones le cuestan y le frenan. No hay que simplificar las ideas; hay que **traducir la notación**. El curso evalúa teoría con exámenes a lápiz y papel (derivar, trazar a mano, predecir, diagnosticar), así que el artefacto es para estudiar teoría, no código.

Regla de oro: **nunca muestres una fórmula sin traducirla, y nunca la muestres antes de un ejemplo con números.**

## 2. Qué leer, qué escribir y qué no tocar

| Lee | No leas |
|---|---|
| Tu brief: `Explicaciones/briefs/0X_*.md` | `guia_intro_pytorch.html` (3 300 líneas; su diseño ya está en `_compartido/`) |
| La slide fuente completa: `slides/*.Rmd` | Los artefactos de otras clases, salvo que tu brief lo pida |
| Esta guía y `Explicaciones/plantilla.html` | |
| `Explicaciones/_compartido/notacion.js` (las claves de los símbolos) | |
| `Explicaciones/_compartido/componentes.js`, solo el encabezado con la API | |

- **Escribe un solo archivo:** `Explicaciones/0X_nombre.html` (el nombre está en tu brief).
- **No edites nada en `_compartido/`.** Si necesitas un símbolo que no existe en `notacion.js` o un componente que no existe, impleméntalo dentro de tu archivo o escribe el símbolo sin `data-s`, y **repórtalo** en tu respuesta final.
- Puedes enlazar imágenes de las slides con ruta relativa (`../images/RNshallow.png`) cuando una figura ayude de verdad. Lista en tu reporte las imágenes que usaste.
- Scripts de verificación (node o python): guárdalos en el scratchpad o en `/tmp`, nunca en el repo.

## 3. Estructura obligatoria

Parte de una copia de `plantilla.html`, conserva su esqueleto (`#progress`, `#scrim`, `.shell`, `nav#toc[data-auto]`, `.topbar`, `.wrap`) y el orden de los scripts (`notacion.js` antes de `componentes.js`, y tu `<script>` al final).

| Orden | Sección | id | Contenido |
|---|---|---|---|
| — | Portada | `inicio` | eyebrow «Aprendizaje Profundo · Artefacto 0X», título, `lead` de 1–2 frases, `.meta` con la fuente y la sección del temario |
| 1 | Mapa de la clase | `mapa` | `.flow` con antes / esta clase / después, y una `.note.key` con LA idea central |
| 2…n | Contenido | libres | Lo que pida el brief. Cada `h2` lleva `<span class="num">Sección N</span>` |
| n+1 | Práctica tipo examen | `practica` | 6 a 10 `.ejercicio` |
| n+2 | Glosario | `glosario` | `.gloss` con los términos de la clase |
| — | Serie | — | `<nav class="serie" data-actual="0X"></nav>` y `footer` |

- Los `h2` y `h3` con `id` arman el índice solos. Para acortar una entrada usa `data-toc="…"`. Para marcar un laboratorio con ◆ usa `class="lab"` en su `h3`.
- Los ids van en minúsculas y con guiones, en español: `perdida-cuadratica`, `lab-epocas`.

## 4. Cómo se presenta una fórmula

Cada fórmula importante va en un bloque `.formula` con estas partes, en este orden:

1. **`.f-head`**: un nombre corto («Actualización de gradient descent»).
2. **`.f-ejemplo`**: un caso con números reales y pequeños, ANTES de la forma general.
3. **`.eq`**: la fórmula general, con color por rol y `.sym` en sus símbolos. Agrega `<div class="leyenda-roles"></div>` la primera vez que aparezcan colores en una sección.
4. **`.f-lectura`**: cómo se dice en voz alta, en español natural, como se lo explicarías a alguien en un café.
5. **`.f-simbolos`**: un `<dl>` con cada símbolo y qué significa AQUÍ.
6. **`.f-efecto`** (cuando aplique): «¿qué pasa si…?» para cada cantidad que se pueda mover: qué ocurre si sube, si baja o si vale cero.

Las fórmulas secundarias pueden ir en un `.eq` simple con su `<span class="lbl">`, pero siempre con una frase que las traduzca justo antes o justo después.

### Color por rol

El color dice qué tipo de cosa es cada símbolo. Es la misma convención en los seis artefactos:

| Rol | Clase | Ejemplos |
|---|---|---|
| parámetro aprendible | `r-param` | φ, θ, Ω, β (sesgos), w, b, γ |
| dato observado | `r-dato` | x, y, n, 𝒟 |
| hiperparámetro (lo eliges tú) | `r-hiper` | η, α, λ, D, K, \|B\|, p, β₁, β₂ |
| cantidad calculada | `r-calc` | ŷ, L, ℓ, h, f<sub>k</sub>, δ, ∇L, m<sub>t</sub> |

`<span class="sym" data-s="clave"></span>` toma el símbolo, el color y la explicación emergente de `notacion.js`. Úsalo en la **primera aparición de cada símbolo dentro de cada sección**, no en todas: si todo está subrayado, nada destaca. En el resto de apariciones basta con el color (`<span class="r-param">φ</span>`) o con texto normal.

Cuando un símbolo tiene dos significados en el curso (β sesgo vs β de momentum; λ regularización vs λ probabilidad; σ desviación vs σ(z) sigmoide; K capas vs K clases), usa la clave correcta y dilo explícitamente en el texto.

### Escribir matemáticas sin LaTeX

Prohibido LaTeX y `$…$`: la vista del usuario no lo renderiza. Usa Unicode y los ayudantes de `estilos.css`:

- Fracción: `<span class="frac"><span class="num">1</span><span class="den">n</span></span>`
- Subíndice y superíndice: `<span class="sub">i</span>` y `<span class="sup">2</span>`, o los caracteres ₀₁₂₃ᵢₖ ²³ᵀ cuando quepan.
- Operador con límites: `<span class="big"><span class="lim">n</span><span class="o">Σ</span><span class="lim">i=1</span></span>`
- Caracteres útiles: φ θ ω Ω β γ η α λ μ σ δ ε ψ · ŷ φ̂ x̂ L̃ · ∂ ∇ Σ Π √ ∞ · ∈ ℝ ≈ ≠ ≤ ≥ ⇒ ⇏ ← → ⊙ ‖ · − (signo menos) × · 𝟙 𝒟 𝒜
- Usa el signo menos «−» (U+2212), no el guion «-», en fórmulas y números negativos. `DL.fmt` ya lo hace.

## 5. Derivaciones

Usa `<ol class="deriv" data-revelar>`: los pasos aparecen de uno en uno.

- **Una sola operación por paso.** Si en un renglón pasan dos cosas, son dos renglones.
- `.d-por` **nombra la regla** en negritas y la aplica: «**log de un producto:** log(a·b) = log a + log b, así que…». Enlaza la regla a su sección del artefacto 00 la primera vez.
- Marca qué cambia en cada paso (puedes resaltar el término con `<b>` o con color).
- Termina con un paso de **verificación con números** o de **interpretación** («el término que no depende de φ desaparece porque…»).

## 6. Laboratorios

Un laboratorio vale la pena si deja **ver algo que la fórmula esconde**. Requisitos:

- **Cálculos reales** en JavaScript, nunca animaciones fingidas. Si el texto dice que algo converge en 12 pasos, el laboratorio debe hacerlo en 12 pasos.
- Usa la API de `componentes.js` (`DL.grafica`, `DL.control`, `DL.selector`, `DL.pasos`, `DL.readout`, `DL.bucle`, `DL.rng`, `DL.matriz`, `DL.fmt`). No reimplementes ejes, controles ni botones.
- Aleatoriedad siempre con semilla (`DL.rng(semilla)`), para que lo que describe el texto coincida con lo que se ve.
- Estado inicial con sentido y un texto que diga qué hacer («mueve η hasta 1.1 y da 5 pasos»).
- Debajo de cada laboratorio, una `.note` con **«Qué observar»**: los 2 a 4 experimentos que vale la pena hacer y qué deberías ver en cada uno.
- Colores en canvas: tokens (`"accent"`, `"g1"`…`"g6"`, `"r-param"`, `"text-3"`), nunca hex fijos, para que funcione el tema oscuro.
- Que funcione con ancho de celular (≥ 360 px). `.lab-grid` ya se apila.
- Unas 150 líneas de JS por laboratorio como orientación. Si pasa de 250, simplifica.
- Sin librerías externas ni CDNs.

## 7. Práctica tipo examen

Entre 6 y 10 `.ejercicio`, del estilo del examen (`Examenes/Examen1_Temario.md` y `Examenes/Examen1_GuiaEstudio.md`):

- `.e-tipo`: Derivar · Calcular · Trazar · Predecir · Diagnosticar · Explicar.
- `.e-tem`: la viñeta del temario que practica («Temario §3 · diseñar una pérdida»).
- Cada uno con `details.pista` (opcional) y `details.respuesta` (obligatoria). La respuesta muestra el **procedimiento**, no solo el resultado.
- **Verifica cada número con un script** (node o python) antes de escribirlo. Un error en la clave de respuestas es lo peor que puede tener este artefacto.
- Mezcla: al menos uno de cálculo a mano, uno de predecir o diagnosticar, y uno de explicar con palabras.

## 8. Tono

- Español, tuteo, frases cortas. Directo y cálido, sin relleno ni frases motivacionales.
- Analogías concretas. Cuando encaje, usa ejemplos de políticas públicas (el curso es de una escuela de gobierno), pero solo si aclaran.
- La primera vez que aparece un término técnico va en español con el inglés entre paréntesis: «pérdida (loss)», «tasa de aprendizaje (learning rate)». Después usa el que usen las slides.
- Usa la notación de las slides, aunque otros libros escriban distinto.
- Formatos útiles: `.q` para «Duda típica» (preguntas que un estudiante haría de verdad), `.note.key` para la idea de fondo, `.note.fix` para trampas comunes, `.note.good` para la lectura intuitiva, `.note.exam` para «En el examen…».
- Sin emojis.

## 9. Fidelidad y alcance

- El contenido sale de la slide. Puedes agregar explicación, ejemplos y laboratorios, pero no temas nuevos. Si algo extra ayuda mucho, ponlo en un `<details>` titulado «Para profundizar».
- Si la slide tiene una errata o una inconsistencia (tu brief señala las conocidas), corrígela en silencio solo si es un typo evidente. Si cambia el contenido, explícalo en una `.note.fix` y repórtalo.
- No inventes resultados, cifras ni citas.

## 10. Extensión

Lectura de 40 a 60 minutos sin contar los laboratorios. El archivo debería quedar por debajo de ~250 KB. CSS propio solo para lo que no exista en `estilos.css` (unas 50 líneas como máximo).

## 11. Antes de entregar

1. `python3 -I Explicaciones/_compartido/revisar.py --render 0X_nombre.html` sin errores.
2. Capturas por sección. Genera una imagen por cada `h2` y revisa **todas** con Read, sin saltarte ninguna. En el piloto quedaron sin revisar las últimas secciones y ahí estaban los errores.
   ```
   python3 -I Explicaciones/_compartido/capturas.py 0X_nombre.html /ruta/scratchpad/claro
   python3 -I Explicaciones/_compartido/capturas.py 0X_nombre.html /ruta/scratchpad/oscuro --oscuro
   ```
   En el tema oscuro basta con revisar las secciones que tienen laboratorios. Busca texto encimado, celdas de tabla que partan una fórmula en varios renglones (usa `style="white-space:nowrap"` en esa celda), gráficas vacías y contraste pobre. Nota: Chrome sin interfaz no baja de 500 px de ancho, así que no intentes simular un celular de 390 px.
3. Repasa la lista: ¿cada fórmula tiene ejemplo y lectura? ¿Los números de los ejercicios están verificados? ¿Cada laboratorio tiene su «Qué observar»?

### Lecciones del piloto (artefacto 00)

- **Símbolos con forma de función.** Algunas entradas de `notacion.js` traen un argumento genérico: `a(·)`, `E[·]`, `Var(·)`, `L(φ)`, `f(x, φ)`, `P(y | x)`. Un `<span class="sym" data-s="a"></span>` vacío pinta «a(·)», y «a(·)( Ωx + β )» queda mal. Cuando escribas el argumento tú mismo, da el contenido explícito: `<span class="sym" data-s="a">a</span>( … )`, `<span class="sym" data-s="E">E[y]</span>`.
- **Afirmaciones sobre el curso.** Antes de escribir «esto no aparece en las clases 1 a 5» o «esto aparece en la clase 3», compruébalo con `grep` en `slides/*.Rmd`. En el piloto se afirmó que sin y cos no aparecían, y sí aparecen: en el ejemplo de backprop de Entrenamiento2 y en el modelo de Gabor de Entrenamiento.
- **Nada en inglés** dentro del texto visible, salvo los términos técnicos entre paréntesis.

### Reporte final al orquestador (tu respuesta)

- Archivo creado, tamaño y resultado de `revisar.py`.
- Secciones y laboratorios incluidos, en una línea cada uno.
- **Símbolos que faltaron** en `notacion.js` (clave propuesta, s, n, rol, l, d).
- Componentes que tuviste que implementar localmente y que convendría compartir.
- Erratas de la slide encontradas y cómo las trataste.
- Dudas de contenido que el orquestador deba revisar.
