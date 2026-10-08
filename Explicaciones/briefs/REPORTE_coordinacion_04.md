# Reporte de coordinación · artefacto 04 y revisión de la serie

Para: Juan (orquestador, edita `_compartido/`). De: Oscar.
Estado: nada de esto está en un commit todavía.

## 1. Qué cambió en el repo

| Archivo | Estado | Qué es |
|---|---|---|
| `Explicaciones/04_entrenamiento2.html` | nuevo, sin rastrear | El artefacto que faltaba, hecho siguiendo `GUIA_ESTILO.md` y `briefs/04_entrenamiento2.md`. Unos 99 KB. |
| `Explicaciones/02_redes_neuronales.html` | modificado (2 líneas) | Ver 1.2. |
| `Explicaciones/05_regularizacion.html` | modificado (2 líneas) | Ver 1.2. |
| `Explicaciones/briefs/REPORTE_coordinacion_04.md` | nuevo | Este reporte. |

No se tocó nada en `_compartido/`.

### 1.1 Artefacto 04

Doce secciones: mapa, el problema, backprop escalar, backprop con ReLU (versión del examen), recurrencia vectorial, saturación y neuronas muertas, inicialización, ruido/sesgo/varianza, double descent, hiperparámetros, práctica y glosario.

- 6 laboratorios con cálculos reales: grafo computacional (con comprobación por diferencias finitas), dos capas con ReLU, recurrencia vectorial, producto de derivadas, ruptura de simetría, propagación de la varianza en 20 capas, 30 datasets de sesgo/varianza y double descent.
- 10 ejercicios tipo examen, con cifras verificadas con scripts.
- `revisar.py --render` pasa sin errores. 136 acciones interactivas sin anomalías.

### 1.2 Correcciones en páginas existentes

| # | Archivo y línea | Antes | Ahora | Por qué |
|---|---|---|---|---|
| 1 | `05_regularizacion.html:1386` | `var res;` | `var res = NUM.esRegla(cur.va, pac, tol);` | `res` se leía en la línea 1389 antes de asignarse. El script se detenía y quedaban sin funcionar los laboratorios de early stopping, dropout, tarjetas de augmentation y simulador de diagnóstico. |
| 2 | `05_regularizacion.html:383` | 54, 15 y «17 y 7» | 53, 19 y «16 y 8» | Con α = 0.07 el laboratorio muestra 81, 53, 19, 6, 8 y 16 corridas en el pozo afilado (para \|B\| = 64, 16, 8, 4, 2 y 1). El texto no coincidía en cuatro cifras. |
| 3 | `02_redes_neuronales.html:1130` | «articulaciónes», «regiónes» | «articulaciones», «regiones» | El código agregaba «es» sin quitar el acento. Ya no queda ese error en ninguna página. |
| 4 | `02_redes_neuronales.html:793` | atribuía «normalización y conexiones residuales» al artefacto 04 | «inicialización: artefacto 04; normalización: artefacto 05» (con enlace a `#batchnorm`) | La normalización está en la 05. Las conexiones residuales no están en ninguna página. |

## 2. Qué hay que coordinar contigo

1. **`_compartido/notacion.js`.** Faltan estas claves, que la 04 escribe sin `data-s`:

   | Clave propuesta | Símbolo | Rol |
   |---|---|---|
   | `Dh` | D_h (fan-in) | hiper |
   | `Din`, `Dout` | D_in, D_out | hiper |
   | `sigmaf` | σ²_f | calc |

   Cuando existan, yo los engancho en la 04.
2. **`_compartido/estilos.css`.** La 04 define localmente `.fig`, `.desfase`, `.twocan`, `.tabnum` y dos ajustes (`.calcline` con salto de línea, grafo más compacto): unas 12 líneas. Decidir si pasan al CSS compartido. Si pasan, los quito de mi página y corro `revisar.py` en las seis.
3. **`briefs/04_entrenamiento2.md`.** Registrar las dos desviaciones del brief (sección 3).
4. **Revisar mis cuatro correcciones de la sección 1.2.** Son tus páginas. Ver con `git diff`.
5. **Commit.** Decidir quién lo hace y en qué rama. Mientras no se haga, la 04 puede perderse con una limpieza de archivos sin rastrear.

## 3. Desviaciones del brief 04

- **Double descent.** El diseño literal del brief (puntos de entrenamiento aleatorios, características ReLU con sesgo normal) no mostraba el segundo descenso: el error de test crecía con p. Lo que funcionó: puntos de entrenamiento equiespaciados en [−1, 1], características ReLU(±(x − u)) con u uniforme en [−1, 1], n = 20, σ = 0.3 y 40 semillas. El pico cae en p = 21 con la mediana y p = 25 con la media. El error de entrenamiento llega a ≈ 0 hacia p ≈ 40, no en p = n. Es un experimento mío y la página lo dice.
- **tanh con He.** El brief insinuaba un problema serio. Lo medí: con 30 capas y D = 100, las pre-activaciones se estabilizan en ≈ 0.8 (≈ 6 % de neuronas saturadas) y con Xavier la señal se encoge a ≈ 0.12. El ejercicio y el laboratorio dicen eso, y que la derivación del ½ no aplica a tanh.

## 4. Qué se verificó en las demás páginas

| Qué | Resultado |
|---|---|
| 45 laboratorios interactivos de 00, 01, 02, 03 y 05 (controles en mínimo, máximo y medio, y todos los botones) | Solo fallaba la 05 (ya corregido). Quedan 3 avisos por diseño: «máscaras sorteadas —» en modo Inferencia de dropout, el «NaN» del Caso 3 del simulador (es el escenario que se enseña) y «c = 0 no vale» en el laboratorio de reescalamiento de la 02. |
| Cifras de «Qué observar» contra lo que calcula cada laboratorio | Coinciden, salvo lo corregido en 1.2 |
| 47 ejercicios de 00, 01, 02, 03 y 05 y los ejemplos con números del texto | Coinciden |
| Capturas en tema claro y oscuro | Sin texto encimado ni gráficas rotas |
| Fórmulas y citas contra las slides (pérdida modificada de GD y SGD, MAP, inverted dropout, erratas θ₂₃ y h′) | Confirmadas |
| Cobertura del temario del examen, §1 a §5 | Completa |
| 102 enlaces internos | Ninguno roto |

## 5. Qué no se pudo comprobar

- No se probó en un navegador normal ni en un celular. Solo Chrome sin interfaz, que no baja de 500 px de ancho.
- No se evaluó la calidad pedagógica de las explicaciones, solo su corrección y cobertura.
- Las respuestas conceptuales de los ejercicios (explicar, diagnosticar) se compararon con las slides, pero no se auditaron una por una.
- Los ejercicios que citan resultados de un laboratorio («30 modelos de 70 % reportaban ≈ 76 %» en 01-7, «9 regiones» en 02-10) se comprobaron contra el laboratorio, no con un script independiente. El de 01 da 76.5 % en el promedio de 100 simulaciones y el de 02 da 9 regiones en el preajuste inicial.
- Los resultados de las corridas del ejercicio 8 de la 05 («casos 7, 4 y 8 del simulador») se comprobaron contra las curvas que genera el simulador (por ejemplo, ln 10 = 2.30 y gradiente ≈ 10⁻⁶ en el caso 4; brecha de 0.07 en el caso 8).

## 6. Pendiente menor, opcional

En la gráfica de double descent de la 04 el error de entrenamiento baja a ≈ 10⁻¹¹ y sale por el fondo del eje (que llega a 10⁻³). El texto de la página lo explica. Se puede ampliar el eje; es solo cosmético.
