# Decisiones técnicas pendientes · `_compartido/` y la serie (06 a 08)

Para Juan. Contexto completo en `REPORTE_coordinacion_06_08.md`. Aquí solo lo que requiere una decisión tuya, con una recomendación y el costo de cada una. Ninguna bloquea el commit: las páginas ya funcionan con lo que hay.

## Ya resuelto en esta ronda (solo para que lo sepas)

| Qué | Dónde | Detalle |
|---|---|---|
| 06, 07 y 08 en la navegación | `componentes.js`, `DL.SERIE` | Tres líneas. |
| 61 símbolos nuevos | `notacion.js` | Grupos `cnn`, `rnn`, `atencion`. Una clave por significado, `s` repetible y «Ojo: …» al final de `d` (la convención de β, λ, σ y K). |
| Avisos «Ojo» en claves viejas | `notacion.js` | `pdrop`, `h`, `alpha`, `theta`, `X`, `eps`, `H`. |
| Tablas de 00 | `00_matematicas.html` | Tres `data-tabla-notacion` nuevas (`not-cnn`, `not-rnn`, `not-atencion`). |
| Estilos repetidos | `estilos.css` | `figure.img`/`.fig`, `.tbl.chica`, `td.nw`, `td.num-c`, `tr.sel`/`on`/`cero`. Se quitaron de 02, 04, 06, 07 y 08. |

## Decisiones

### D1 · Mover `mapaAtencion`, `softmaxM` y la escala igual a `componentes.js`

| | |
|---|---|
| Qué es | `mapaAtencion(canvas, filas, cols, obtener)`: mapa de calor de una matriz con el número en cada celda y celdas tachadas (hoy en 08, sobre `DL.grafica`). `softmaxM`: softmax que acepta −∞ (`DL.softmax` da NaN si todo vale −∞). Escala igual en los dos ejes: 07 la reimplementa recalculando el rango de x dentro del laboratorio de clipping. |
| Recomendación | Sí, pero después del commit y en una pasada aparte. Los tres sirven a más páginas (matrices de confusión, máscaras, trayectorias 2D). |
| Costo | Hay que reemplazar los usos locales en 07 y 08 y volver a correr `revisar.py --render`. Un error en `softmaxM` rompe los laboratorios de máscaras. Se dejó fuera de esta ronda precisamente para no arriesgarlos. |
| Si dices no | No pasa nada: son ~60 líneas locales y ya están probadas. |

### D2 · Pasar al CSS compartido las reglas que quedan locales

| Grupo | Reglas | Dónde se usan | Recomendación |
|---|---|---|---|
| Ya señaladas por el reporte 04 | `.desfase`, `.twocan`, `.tabnum`, `.calcline` y el grafo compacto | 04 | Pasarlas solo si otra página las va a necesitar. Si no, dejarlas. |
| Visuales de laboratorios | `.pila3`, `.sub-h`, `.calc-btns` | 06 | Dejar local. |
| Específicas de 08 | `.heat-grid`, `.toks`, `.etapa`, `.caso`, `.fb`, `.wlist`, `.salida` | 08 | Dejar local. |
| Específica de 07 | `.corpus`, `.lab-stack` | 07 | Dejar local. |

Criterio sugerido: se comparte lo que aparece en dos o más páginas; el resto, local. La guía limita el CSS propio a ~50 líneas por página y 08 usa ~30, así que ninguna se acerca al tope.

### D3 · Mayúsculas en encabezados de tabla generados por JS

| | |
|---|---|
| Problema | `estilos.css` convierte a mayúsculas los `th`. `DL.protegerMayusculas` no protege encabezados con notación como «n(c, w)». 07 lo resolvió a mano en cada celda; 06 también tuvo que anular la conversión en etiquetas («p» salía como «P», «r₀» como «ro»). |
| Recomendación | Extender `DL.protegerMayusculas` para que respete los `th` que contienen `<sub>`, `<sup>` o `data-s`, o agregar una clase `th.sin-mayus` en CSS. Es el cambio con mejor relación costo/beneficio de la lista. |
| Costo | Una regla de CSS o unas 5 líneas de JS. Afecta a todas las páginas, así que hay que correr `revisar.py` y las capturas en las diez. |

### D4 · Documentación de la guía y de las herramientas

Quedaron desactualizados por la ampliación a 9 artefactos:

| Qué | Dónde | Cambio sugerido |
|---|---|---|
| «los seis artefactos» (color por rol) | `GUIA_ESTILO.md` §4 | «todos los artefactos de la serie». |
| «cierra el material del Examen 1» | `briefs/05_regularizacion.md` | Es cierto para el Examen 1; solo aclarar que 06 a 08 cubren el Examen 2. |
| Instrucciones de `capturas.py` | `GUIA_ESTILO.md` §11 | Dejarlo con el ejemplo completo (archivo y carpeta de salida). Un agente llamó al script sin la carpeta y falló con `IndexError`. Opcional: que el script imprima el uso en vez del traceback. |
| «el piloto» (artefacto 00) | `GUIA_ESTILO.md` §11 | Añadir las lecciones de 06 a 08 (secc. 4 de este archivo). |

### D5 · `revisar.py` y `capturas.py`

| Punto | Estado | Recomendación |
|---|---|---|
| Ruta de Chrome fija a macOS | `CHROME = "/Applications/Google Chrome.app/…"` en ambos scripts | Aceptar una variable de entorno (`CHROME_BIN`) y caer a la ruta actual. Hoy es inútil en Linux o Windows. |
| `capturas.py` escribe un `_tmp_capturas_*.html` en `Explicaciones/` mientras corre | Si dos agentes capturan a la vez, conviven (el nombre lleva el PID) y se limpian al terminar. Si un proceso muere, el archivo queda | Escribirlo en un directorio temporal del sistema. Para evitar que un temporal se cuele en un commit. |
| Cobertura de `revisar.py` | Ya detecta LaTeX, `data-s` inexistentes, enlaces rotos y fórmulas sin lectura | Sería útil añadir un aviso cuando una clave de `notacion.js` no se use en ninguna página. Hoy hay 24 claves sin ningún `data-s`, entre ellas `Dh` y `Din`, que el reporte 04 pidió para engancharlas en 04 (pendiente en 04), y `pos` y `dff` de 08. `Din` ya cubre D_in y D_out en una sola entrada; no existe aún la clave `sigmaf` (σ²_f) que ese reporte también pedía. |

### D6 · Convención de `notacion.js`: ¿una clave por significado o un solo grupo por rol?

Las clases 1 a 5 agrupan las tablas de 00 por rol (`datos`, `parametros`, `hiper`, …). Esta ronda introdujo grupos por clase (`cnn`, `rnn`, `atencion`) porque así lo acordamos con Oscar, y no mezclar 60 filas nuevas con las existentes.

| Opción | Efecto |
|---|---|
| Mantener los tres grupos nuevos (lo actual) | Tablas más cortas y se lee por clase; la letra repetida (X, H, V…) aparece en dos tablas. |
| Reasignar cada símbolo a su grupo por rol | Una sola vista por rol, pero la tabla de «calculadas» pasaría de 22 a ~50 filas y mezclaría clases. |

Recomendación: mantener lo actual. Si se mantiene, que las clases 1 a 5 conserven los grupos por rol y que los futuros artefactos (por ejemplo, agentes) agreguen su grupo por clase.

### D7 · Anclas faltantes para enlaces cruzados

08 nombra el «encoder-decoder recurrente» sin enlazarlo porque 07 no tiene una sección con ese tema. Dos opciones: crear en 07 una sección corta con ancla `#encoder-decoder` (la slide RNN no la trata a fondo, así que sería un «Para profundizar»), o dejarlo sin enlace. Recomendación: dejarlo sin enlace; el tema es de 08.

### D8 · `04_entrenamiento2_alt.html`

Está en el repo, sin documentación en la guía, los briefs ni los reportes. Pasa `revisar.py`. Durante el trabajo apareció borrado en `git status` y se restauró, sin saber qué lo borró. Decidir si se conserva (y documentar qué es y en qué difiere de 04) o se elimina. Mientras no se decida, `revisar.py` lo revisa en cada corrida completa.

### D9 · Desviaciones del brief 04 sin registrar

Pendiente del reporte 04: anotar en `briefs/04_entrenamiento2.md` el diseño de double descent que funcionó (puntos equiespaciados, características ReLU(±(x − u)), n = 20, σ = 0.3, 40 semillas) y la medición de tanh con He. Es solo texto.

## Orden sugerido

1. D8 y D9 (decisión y texto; no tocan código).
2. D4 (documentación).
3. D3 (un cambio pequeño con efecto en todas las páginas).
4. D5 (scripts).
5. D1 y D2 (refactorización, después del commit y con revisión completa).
6. D6 y D7 no requieren trabajo si estás de acuerdo con las recomendaciones.

## Lecciones de 06 a 08 para la guía (D4)

- Las claves con argumento (`a(·)`, `E[·]`) se usan con contenido explícito. Se extendió a cualquier símbolo con subíndices: `<span class="sym" data-s="Ht">H<sub>t</sub></span>`.
- Para letras que chocan, el color de rol y la clave correcta resuelven la mayoría; el texto solo vuelve a aclarar si el choque está en la misma sección.
- Cuando el artefacto necesita una cifra de un laboratorio con semilla, se verifica con un script que reimplemente `DL.rng` (mulberry32): varios valores que un agente escribió «de memoria» estaban mal en la segunda cifra.
- Verificar los números de una página con un agente que no la construyó funcionó: no encontró errores, pero sí dos imprecisiones de redacción que el constructor no vio.
