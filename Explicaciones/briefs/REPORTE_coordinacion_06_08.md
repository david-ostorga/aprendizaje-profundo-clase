# Reporte de coordinación · artefactos 06, 07 y 08 (Examen 2)

Para: Juan (orquestador) y Oscar. Estado: nada de esto está en un commit todavía; Oscar lo hace.

## 1. Qué cambió en el repo

| Archivo | Estado | Qué es |
|---|---|---|
| `Explicaciones/06_cnn.html` | nuevo | Redes convolucionales (117 KB). |
| `Explicaciones/07_rnn.html` | nuevo | Redes recurrentes y modelos de lenguaje (127 KB). |
| `Explicaciones/08_transformers.html` | nuevo | Atención, Transformers y LLMs (144 KB). |
| `Explicaciones/briefs/06_cnn.md`, `07_rnn.md`, `08_transformers.md` | nuevos | Un brief por artefacto, con la estructura del 05. |
| `Explicaciones/briefs/REPORTE_coordinacion_06_08.md` | nuevo | Este reporte. |
| `Explicaciones/_compartido/componentes.js` | modificado | 06, 07 y 08 agregados a `DL.SERIE` (navegación de la serie). |
| `Explicaciones/_compartido/notacion.js` | modificado | 61 símbolos nuevos (secc. 2.1) y siete avisos «Ojo» en claves existentes. |
| `Explicaciones/_compartido/estilos.css` | modificado | Estilos compartidos nuevos (secc. 2.2). |
| `Explicaciones/00_matematicas.html` | modificado | Tres tablas de notación nuevas (clases 6, 7 y 8) y un texto ajustado. |
| `Explicaciones/02_redes_neuronales.html`, `04_entrenamiento2.html` | modificados | Solo se quitaron del `<style>` local las reglas que pasaron a `estilos.css`. |

`04_entrenamiento2_alt.html` apareció borrado en `git status` durante el trabajo. No se sabe qué lo borró; se restauró con `git restore` y pasa `revisar.py`. Conviene confirmar que sigue en el commit.

### 1.1 Contenido de los artefactos

| | Secciones | Laboratorios | Ejercicios | Glosario |
|---|---|---|---|---|
| 06 CNN | 13 | 6 (desplazamiento de señal, convolución 2D, calculadora de arquitecturas, receptive field, pooling y upsampling, IoU) | 10 | 32 términos |
| 07 RNN | 15 | 7 (tendencia, bigramas y smoothing, RNN desenrollada, producto en el tiempo, clipping, compuertas LSTM/GRU, entre otros) | 10 | 37 términos |
| 08 Transformers | 15 | unos 12 (atención a mano, √d_k, multi-head, orden y posición, máscaras, forma del tensor, BPE, etapas del asistente, LoRA y MoE, árbol de decisión) | 10 | 41 términos |

Cobertura del temario del Examen 2, §1 a §4: completa (verificada por el revisor independiente).

### 1.2 Cómo se construyó

- Brief y HTML de cada artefacto: un agente Opus 5.5 (esfuerzo medio) por artefacto, en paralelo.
- Verificación independiente: un agente Sonnet 5.5 (esfuerzo medio) recalculó con scripts propios todos los números de los 30 ejercicios y de los ejemplos y laboratorios, y los contrastó con las slides y el temario. No encontró errores numéricos.
- Integración de símbolos y enlaces: tres agentes Sonnet 5.5 (esfuerzo medio), uno por archivo, más trabajo directo en `_compartido/`.

## 2. Cambios en `_compartido/`

### 2.1 `notacion.js`

61 claves nuevas, en tres grupos nuevos: `cnn` (19), `rnn` (20) y `atencion` (22, con `hhead`).

Convención, igual a la de β, λ, σ y K de las clases 1 a 5: una clave por significado, el campo `s` puede repetirse y `d` termina con «Ojo: …». Choques resueltos:

| Letra | Claves |
|---|---|
| X | `X` (matriz de datos), `Ximg` (imagen) |
| p | `pdrop` (dropout), `pad` (padding) |
| s | `stride`, `sdec` (estado del decoder) |
| H | `H` (cross-entropy), `Ht` (estado oculto), `Hmap` (mapa de salida) |
| V | `V` (\|V\|, vocabulario), `Vker` (kernel) |
| r | `rl` (receptive field), `rt` (compuerta reset), `rlora` (rango de LoRA) |
| h | `h` (unidad oculta), `nheads` (cabezas), `hhead` (salida de una cabeza) |
| A | `Aatt` (atención), `Alora` (LoRA) |
| α | `alpha` (tasa de aprendizaje), `alphaAtt` (peso de atención) |
| θ | `theta` (parámetros), `thetaclip` (umbral de clipping) |
| ε | `epsruido`, `eps` (estabilizador), `epsSmooth` (smoothing) |
| z | `z` (preactivación), `zt` (update gate) |
| f, o | `fk`/`ft`, `O_t`/`ot` |

Se agregó un aviso «Ojo» a las claves existentes `pdrop`, `h`, `alpha`, `theta`, `X`, `eps` y `H`.

### 2.2 `estilos.css`

Pasaron a compartidos, y se quitaron de las páginas: `figure.img` y `.fig`, `.tbl.chica`, `.tbl td.nw`, `.tbl td.num-c`, `.tbl tr.sel`, `.tbl tr.on` y `.tbl tr.cero`. Los 04, 06, 07 y 08 ya no los redefinen; el 02 tampoco.

Sigue siendo local, y puede quedarse así: lo propio de cada laboratorio (`.pila3`, `.sub-h`, `.calc-btns`, `.heat-grid`, `.toks`, `.etapa`, `.caso`, `.fb`, `.corpus`) y las reglas de 04 que el reporte 04 ya había señalado (`.desfase`, `.twocan`, `.tabnum`, `.calcline`). Estas últimas siguen sin decidirse.

### 2.3 Lo que se dejó fuera a propósito

- `mapaAtencion(canvas, filas, cols, obtener)` (mapa de calor de una matriz con números en cada celda y celdas tachadas) y `softmaxM` (softmax que admite −∞; `DL.softmax` da NaN si todo es −∞) están implementados dentro de 08. Convendría moverlos a `componentes.js`, pero se dejaron para no arriesgar los laboratorios.
- Opción de `DL.grafica` para usar la misma escala en los dos ejes (la implementó 07 en el laboratorio de clipping).

## 3. Decisiones de contenido tomadas con Oscar

Se aceptó todo lo que los agentes agregaron más allá de las slides:

- 06: ejemplo ResNet de 20 contra 56 capas (He et al.), «LeCun las usaba en 1998» y el umbral típico de IoU de 0.5. La recurrencia del receptive field viene del formulario del examen de práctica, no de la slide, y el texto lo dice. El tamaño de una transposed convolution y el vector de 30 números por celda de YOLO van en «Para profundizar».
- 07: el sesgo de la forget gate inicializado en 1 y los dos sesgos por pieza en PyTorch (en «Para profundizar»), y la analogía con las conexiones residuales.
- 08: d_model = 12 288 de GPT-3 (en «Para profundizar») y las respuestas de ejemplo del laboratorio «Una instrucción, cuatro etapas», rotuladas como ilustrativas.
- 07: el laboratorio de BPTT muestra que con tanh el gradiente casi nunca explota (gana la saturación); la explosión pura se ve en el modo «factor constante».

## 4. Desviaciones y notas de las slides

- 07: 0.9¹⁰⁰ vale 0.0000266 (la slide redondea a 0.00003). La slide escribe X_tW_xh (fila·matriz), al revés de Ωh de las clases 2 a 4, y el texto lo explica. Se sigue la convención de z de la slide en la GRU (z ≈ 1 conserva) y se advierte de la contraria.
- 08: la slide pone LayerNorm después de cada subcapa (post-LN) y el notebook antes (pre-LN); el texto explica ambas. «Invariante al orden» se precisa como «equivariante a permutaciones» en un párrafo breve. La curva de similitud de la codificación posicional con d = 16 vuelve a subir a 0.81 en p′ = 14; el texto lo dice y matiza la slide.
- 06: la convención de esquinas del bilineal no está fijada en la slide; el laboratorio usa esquinas alineadas y lo aclara.

## 5. Qué se verificó

| Qué | Resultado |
|---|---|
| `revisar.py --render` sobre los 10 HTML de la serie y `04_entrenamiento2_alt.html` | Todos OK, sin errores ni avisos. |
| Respuestas de los 30 ejercicios, ejemplos con números y laboratorios con semilla (recálculo independiente) | Coinciden. |
| Fórmulas y datos contra `slides/CNN.Rmd`, `RNN.Rmd`, `Transformers.Rmd` y `Examen2_Temario.md` | Coinciden; cobertura §1 a §4 completa. |
| Referencias a «otras clases», al `Examen2_GuiaEstudio.md` y a los notebooks (con `grep`) | Existen. |
| Enlaces internos y entre artefactos, e imágenes | Ninguno roto. |
| Capturas en claro (todas las secciones de cada artefacto) y en oscuro (secciones con laboratorio) | Sin texto encimado ni gráficas rotas, tras corregir lo que se encontró. |
| Tooltips (`data-s`) en 06 (27), 07 (81) y 08 (38) | Sin formas genéricas erróneas en las capturas revisadas. |

Correcciones menores tras la verificación: 07 decía que la Tarea 7 corre con 2 000 ejemplos con momentum y Adam; solo es con Adam. 08 decía que sin escalar «el libro 1 se lleva casi todo»; ahora dice «cerca del 80 %».

## 6. Qué no se pudo comprobar

- No se probó en un navegador normal ni en un celular, solo en Chrome sin interfaz (que no baja de 500 px).
- No se evaluó la calidad pedagógica de las explicaciones, solo su corrección y cobertura.
- Los `data-s` se revisaron con capturas de unas pocas secciones por archivo, no una por una.
- En 08, los textos de «Una instrucción, cuatro etapas» son ilustrativos, no salida real de un modelo.

## 7. Pendiente

1. **Commit** (Oscar): 6 archivos nuevos entre HTML y briefs, este reporte y 7 modificados. Revisar con `git status` que `04_entrenamiento2_alt.html` no aparezca borrado.
2. Probar los tres artefactos en un navegador normal y en el celular, y leerlos para juzgar la pedagogía.
3. Decidir si `mapaAtencion`, `softmaxM` y la escala igual en ejes pasan a `componentes.js`.
4. Decidir si `.desfase`, `.twocan`, `.tabnum` y `.calcline` de 04 pasan a `estilos.css`.
5. Registrar en el brief 04 las dos desviaciones que ya anotó el reporte 04 (double descent y tanh con He). Sigue pendiente de ese reporte.
6. 08 nombra «encoder-decoder recurrente» sin enlace porque 07 no tiene una sección con ese ancla. Se puede crear.
7. Pendientes cosméticos opcionales: ampliar el eje de la gráfica de double descent de 04, y comentar en 08 que la desviación de 1.56 con d = 2 queda por encima de √2 = 1.41 por el efecto de la semilla.
8. Fuera de alcance de esta ronda: no hay artefactos para `Agentes` ni `EticayPreguntas` (el Examen 2 no los cubre), y `04_entrenamiento2_alt.html` sigue sin documentación.
