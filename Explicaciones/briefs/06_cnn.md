# Brief 06 · Redes convolucionales (abre el Examen 2)

- **Archivo:** `Explicaciones/06_cnn.html` · `nav.serie data-actual="06"`
- **Título:** «Redes convolucionales: mirar de cerca y reutilizar lo que se aprende»
- **Fuente:** `slides/CNN.Rmd` (1 367 líneas). Léela completa.
- **Temario:** `Examenes/Examen2_Temario.md` §1 (Redes convolucionales) y, para el último bloque, §5 (Diseño aplicado: split por unidad y por tiempo, métricas por subgrupo). Formulario del examen de práctica (`Examenes/Examen2_GuiaEstudio.md`, «Formulario: arquitecturas»): tamaño de salida, parámetros y **recurrencia del receptive field** r_l = r_{l−1} + (k_l − 1)·j_{l−1}, j_l = j_{l−1}·s_l, con r₀ = j₀ = 1. Esa recurrencia NO está en la slide, pero el examen la da y el temario pide calcular el receptive field: úsala y dilo.
- **Tarea relacionada:** `tareas/Tarea6.ipynb` (optimizadores SGD vs Adam, grid dropout × weight decay en small_data, augmentation conservador vs ruido en inputs). Notebook: `notebooks/NotebookCNN.ipynb` (MLP vs CNN en MNIST; CNN = Conv(1→32, 3, p1) → MaxPool 2 → Conv(32→64, 3, p1) → MaxPool 2 → Linear(3136→128) → Linear(128→10)).
- **Enlaza a 00:** `#sumas` (Σ doble), `#producto-punto` (la convolución es un producto punto local), `#funciones`, `#matriz-vector` (1×1 = capa lineal por pixel) y `#sym-<clave>`. Enlaza a `02_redes_neuronales.html#contar-parametros` (conteo de una capa densa), `04_entrenamiento2.html#gradientes-que-se-apagan` (por qué ResNet), `04_entrenamiento2.html#sesgo-inductivo`, `05_regularizacion.html#augmentation`, `05_regularizacion.html#dropout`, `05_regularizacion.html#transfer-learning` y `05_regularizacion.html#catalogo` (la arquitectura como regularización).

## Objetivo

Que el estudiante entienda una CNN como **una capa densa con dos restricciones**, localidad y compartición de parámetros, y que sepa derivar esa restricción desde H = U + ΣΣ W X. Que domine la **aritmética** que el examen pide a mano (tamaño de salida, parámetros, costo, receptive field), que distinga **equivarianza** (la da la convolución) de **invarianza** (la dan el pooling y la agregación global) y que pueda razonar sobre arquitecturas (AlexNet, ResNet), tareas (clasificación, detección, segmentación) y el caso de política pública de Jean et al. (2016).

## Secciones

1. **`mapa`:** antes (05: la arquitectura como forma de regularizar; sesgo inductivo), esta clase, después (07: compartir parámetros en el tiempo en vez del espacio). `.note.key`: «una convolución es una capa densa a la que le prohibimos mirar lejos y le obligamos a usar los mismos pesos en todas partes».

2. **`por-que` · Por qué no una red densa sobre pixeles.**
   - Las tres tareas (clasificación, detección, segmentación) en una tabla: qué sale de la red en cada una.
   - El conteo de la slide: 224·224·3 = 150 528; 150 528² ≈ 22.7·10⁹ pesos. `.formula` con ejemplo chico primero (MNIST 28×28: 784² + 784 = 615 440).
   - Las dos propiedades que la red densa ignora (pixeles cercanos relacionados; patrones que aparecen en cualquier lugar) y las dos ideas (localidad, compartición). Wally como analogía. Jerarquía pixeles → bordes → partes → objetos, con la advertencia de la slide («intuición útil, no descripción perfecta»).

3. **`invarianza` · Invarianza y equivarianza.**
   - Definiciones f(t[x]) = f(x) y f(t[x]) = t[f(x)], con `.formula` y ejemplo numérico 1D (desplazar una señal).
   - Clasificación quiere invarianza; segmentación quiere equivarianza. La convolución es equivariante a traslaciones (aproximadamente: los bordes rompen la exactitud); la invarianza aparece con pooling, downsampling o agregación global.
   - Cuándo la invarianza es mala idea: 6 vs 9 con rotación, señales de tránsito con espejo, radiografías (enlaza a 05 augmentation).
   - **Laboratorio «Desplaza la señal»:** señal 1D de 20 posiciones con un patrón; un filtro de 3 pesos; un control de desplazamiento s. Tres gráficas calculadas en vivo: entrada, salida de la convolución (se mueve exactamente s), max-pooling 2 con stride 2 (con s par se mueve s/2; con s impar cambian los valores) y el máximo global (no cambia). Readout con la posición del máximo y si cada salida es «igual», «desplazada» o «distinta».

4. **`convolucion` · De la capa densa a la convolución.**
   - **Derivación** (`data-revelar`): H_{i,j} = U_{i,j} + Σ_k Σ_l W_{i,j,k,l}X_{k,l} → reindexar k = i + a, l = j + b → compartir (V ya no depende de i, j; U se vuelve un solo u) → localidad (a, b entre −Δ y Δ). En cada paso, el conteo de parámetros para una imagen de 28×28: 615 440 → 615 440 (reindexar no ahorra nada) → 3 026 → 10.
   - `.formula` principal H_{i,j} = u + Σ_{a=−Δ}^{Δ} Σ_{b=−Δ}^{Δ} V_{a,b} X_{i+a,j+b} con ejemplo numérico de una posición.
   - Convolución matemática vs correlación cruzada: la primera voltea el kernel; como los pesos se aprenden, la red aprendería el kernel volteado. Ejemplo con un kernel asimétrico.
   - **Laboratorio «Convolución 2D paso a paso»:** entrada 5×5 de enteros chicos, kernel 3×3 a elegir (borde vertical, borde horizontal, identidad, asimétrico), selector de padding (0, 1), stride (1, 2) y operación (correlación / convolución). `DL.pasos` recorre cada posición de salida: ventana resaltada en la entrada, kernel, productos en `.calcline`, celda de salida. Tamaños 3×3, 5×5, 2×2 y 3×3 según p y s (verificados).

5. **`canales` · Canales.**
   - Tensores alto × ancho × canales; X_{i,j,c}. Pesos (c_o, c_i, k_h, k_w). `.formula` H_{i,j,d} = ν_d + Σ_a Σ_b Σ_c V_{d,c,a,b}X_{i+a,j+b,c} con ejemplo de 2 canales (2 + 1 + 0.5 = 3.5).
   - `.formula` del conteo c_o c_i k_h k_w + c_o con ejemplo 3 → 16, 3×3: 448; «¿qué pasa si…?» duplicar c_i y c_o (1 760, casi ×4; el bias solo ×2).
   - Convolución 1×1: mezcla canales, no vecinos; capa lineal ℝ^{c_i} → ℝ^{c_o} compartida en todas las posiciones (enlace a 00 `#matriz-vector`); usos (cambiar canales, combinar, abaratar antes de un 5×5). Ejemplo numérico de un pixel con 3 canales → 2.
   - `.note.fix`: los canales no son features humanas limpias.

6. **`tamano` · Tamaño de salida, padding, stride y costo.**
   - Sin padding (n − k + 1), con padding (n + 2p − k + 1), same padding p = (k − 1)/2, stride y el floor. `.formula` completa ⌊(n + 2p − k)/s⌋ + 1 con ejemplos 28 → 26, 28, 14; y 8 con k = 3, s = 2 → 3 (la última columna no se usa: por eso el floor).
   - Por qué el padding: las esquinas participan en menos ventanas.
   - Costo: número de salidas alto_out × ancho_out × c_o (slide) y, por cada una, c_i·k_h·k_w multiplicaciones. Ejemplo con las dos convoluciones del notebook (225 792 y 3 612 672). Duplicar la resolución no cambia parámetros pero multiplica el costo por 4.
   - **Laboratorio «Calculadora de arquitecturas»:** lista editable de capas (conv, pooling, densa) con k, s, p y c_o; tabla por capa con forma de salida, parámetros, receptive field (r, j) y multiplicaciones. Presets: «CNN del notebook (MNIST)» (320, 0, 18 496, 0, 401 536, 1 290; total 421 642, 95.5% en las densas: la misma lección que AlexNet), «Ejemplo del temario» (64×64×3, 16 filtros 5×5, p = 2, s = 2, luego 3×3) y «Solo convoluciones 3×3». Estado de error si una salida queda ≤ 0.

7. **`receptive-field` · Feature maps y receptive field.**
   - Definiciones. Por qué crece con profundidad y con stride/pooling.
   - `.formula` de la recurrencia (del formulario del examen), con ejemplo: conv 3 → pool 2 → conv 3 da r = 3, 4, 8.
   - Derivación corta con la red del notebook: r = 3, 4, 8, 10 con j = 1, 2, 2, 4.
   - **Laboratorio «Receptive field en 1D»:** 24 posiciones de entrada, 1 a 4 capas, k ∈ {3, 5}, stride de la primera capa ∈ {1, 2}, control para elegir una neurona de la última capa. Dibuja las capas como filas de nodos y resalta, capa por capa, de qué nodos depende. Compara el conteo visual con la fórmula (y explica que en los bordes el conteo es menor porque parte de la ventana cae en el padding).
   - `.note.exam` sobre el A3 del examen de práctica (si el RF no cubre la imagen, la decisión ignora el resto).

8. **`pooling` · Pooling y upsampling.**
   - Max y average pooling; sin parámetros; ventana, stride, padding; por canal. No crea invariancia total.
   - Upsampling: repetir, max-unpooling (guardar posiciones), bilineal (sin parámetros, más suave), transposed convolutions (aprendibles; el tamaño depende de k, s, p y output padding).
   - **Laboratorio «Bajar y subir resolución»:** mapa 4×4; pooling max/avg 2×2 s2 → 2×2; upsampling por el método elegido → 4×4 (repetir, max-unpooling, bilineal con esquinas alineadas, transposed conv con kernel 2×2 fijo y stride 2). Botón «desplazar 1 pixel»: cuántas de las 4 salidas del pooling cambian (con el mapa por defecto, max pasa de [[4, 2], [2, 5]] a [[4, 3], [2, 5]]: cambia 1 de 4). Readout con el error medio de reconstrucción.

9. **`arquitecturas` · ImageNet, AlexNet y ResNet.**
   - ImageNet/ILSVRC (cifras de la slide). AlexNet: los ingredientes (5 conv, FC, ReLU, GPU, augmentation, dropout, SGD con momentum, L2) y «no fue solo una arquitectura». La mayoría de parámetros en las FC: demuéstralo con el notebook (95.5%), no con cifras de AlexNet que la slide no da.
   - ResNet: el problema (más capas ⇒ peor error de *entrenamiento*, no sobreajuste). `.formula` h_{k+1} = h_k + F(h_k) con ejemplo de derivadas: plana, 10 bloques con F′ = 0.1 ⇒ 0.1¹⁰ = 10⁻¹⁰; residual ⇒ 1.1¹⁰ ≈ 2.59. Por qué reaparece en Transformers. CNNs modernas y «CNNs hoy» (el recuadro de la slide).

10. **`deteccion` · Detección, segmentación y métricas.**
    - Métricas por tarea (tabla). `.formula` IoU con ejemplo (cajas 4×4 desplazadas: 9/23 ≈ 0.391).
    - **Laboratorio «IoU»:** caja verdadera fija y caja predicha con controles de posición y tamaño; dibuja intersección y unión, calcula IoU.
    - YOLO: cuadrícula S×S (7×7, dos cajas por celda en el original), qué predice cada celda, NMS, preentrenado en clasificación (transfer). Detalle del vector por celda (5 números por caja + 20 clases en PASCAL VOC = 30) solo en «Para profundizar».
    - Segmentación: predicción por pixel; encoder-decoder (U-Net); skip connections = detalle espacial + contexto semántico.

11. **`politicas` · CNNs y políticas públicas: pobreza desde el cielo.**
    - El problema de las encuestas; Jean et al. (2016) en dos pasos con `.flow` (ImageNet → luminosidad nocturna → consumo/riqueza). Por qué la luminosidad sirve de tarea intermedia y por qué es un proxy imperfecto.
    - Qué aprende la red; el supuesto de estabilidad entre regiones y en el tiempo.
    - Lo que puede salir mal (la lista de la slide) y la conexión con el temario §5: split por localidad/región y por tiempo, no por imagen; métricas por subgrupo (rural/urbano).

12. **`practica`** y **`glosario`**.

## Práctica (10)

Todos los números verificados en Python (scratchpad `verif.py`).

1. **Calcular:** entrada 96×96×3; capa 1: 32 filtros 5×5, p = 2, s = 2; capa 2: 64 filtros 3×3, p = 1, s = 1. Salidas 48×48×32 y 48×48×64; parámetros 2 432 y 18 496; RF tras la capa 2: 9×9 (r = 5, j = 2; r = 5 + 2·2 = 9).
2. **Calcular:** correlación cruzada a mano de una entrada 4×4 con un kernel Sobel 3×3 (sin padding) ⇒ [[−3, 0], [1, −5]]. ¿Qué sale con convolución matemática? ⇒ [[3, 0], [−1, 5]] (el Sobel volteado es su negativo).
3. **Predecir:** duplicar c_i y c_o (parámetros y cómputo ×≈4); duplicar alto y ancho de la entrada (parámetros iguales, cómputo ×4).
4. **Calcular:** RF de conv3 → conv3 → pool2 s2 → conv3 (r = 3, 5, 6, 10); ¿cuántas conv 3×3 con stride 1 hacen falta para cubrir 28 pixeles? (14, r = 29).
5. **Calcular:** cuello de botella 1×1: 28×28×192 → 5×5 a 64 canales directo (240 844 800 multiplicaciones, 307 264 parámetros) vs 1×1 a 32 y luego 5×5 a 64 (44 957 696 multiplicaciones, 57 440 parámetros; ≈ 5.4 veces menos cómputo).
6. **Explicar:** invarianza vs equivarianza; qué quieres para clasificar pobreza por localidad y para segmentar techos; un ejemplo donde la invarianza es mala idea.
7. **Explicar (V/F):** max-pooling hace a la red invariante a cualquier traslación (F); una 1×1 no mezcla nada (F); una capa de pooling sí tiene parámetros (F); voltear el kernel cambia lo que la red puede aprender (F).
8. **Calcular:** IoU de A = [0, 4]×[0, 4] y B = [2, 6]×[1, 5] ⇒ 6/26 ≈ 0.231.
9. **Diagnosticar:** una red plana de 56 capas tiene MÁS error de entrenamiento que una de 20. ¿Sobreajuste? (No: optimización.) ¿Qué propone ResNet y por qué ayuda?
10. **Diagnosticar (crítica, temario §5):** un agente entrena desde cero con 800 localidades × 12 imágenes, split aleatorio por imagen, y reporta 94%. Señala los problemas (fuga entre imágenes de la misma localidad; pocos datos sin transfer; sin métricas por subgrupo) y corrígelos.

## Glosario

Red convolucional (CNN), localidad, compartición de parámetros, kernel (filtro), convolución, correlación cruzada, canal, feature map, padding, same padding, stride, receptive field, convolución 1×1, pooling (max, average), pooling global, invarianza, equivarianza, upsampling, max-unpooling, interpolación bilineal, transposed convolution, conexión residual, ImageNet/ILSVRC, top-5 error, IoU, mAP, YOLO, Non-Maximum Suppression, encoder-decoder, U-Net, skip connection, proxy (luminosidad nocturna), split espacial.

## Avisos

- **Notación:** la slide usa X (imagen), H (capa intermedia), W y U (capa densa), V y u (convolución), ν_d (sesgo del canal d), Δ (radio), c_i, c_o, k_h, k_w, n_h, n_w, p_h, p_w, s_h, s_w. Ninguno está en `notacion.js` (X existe, pero como «matriz de datos»): escríbelos con color de rol y sin `data-s`, y repórtalos. Ojo con dobles significados: **p** es padding aquí y probabilidad de dropout en 05; **k** es tamaño de kernel y, en ResNet, el índice de bloque; **c** es índice de canal de entrada y c_i, c_o son números de canales.
- La slide llama «canal» a d en la fórmula, pero en «Canales de entrada y salida» escribe c_i y c_o como números; dilo.
- La recurrencia del receptive field viene del formulario del examen, no de la slide.
- La slide del bilineal no fija la convención de esquinas; usa «esquinas alineadas» y dilo en el laboratorio.
- La slide no da la fórmula del tamaño de salida de una transposed convolution; si la mencionas, va en «Para profundizar».
- Imágenes útiles de `../images/`: `kernel1.png`, `padding1.png`, `stride1.png`, `receptive2.png`, `multiplescanales.png`, `conv1x1.png`, `maxpooling.png`, `yolo.png`. Úsalas solo si aclaran.
