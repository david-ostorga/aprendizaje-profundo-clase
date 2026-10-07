# Brief 04 · Entrenamiento 2: backprop, inicialización y desempeño

- **Archivo:** `Explicaciones/04_entrenamiento2.html` · `nav.serie data-actual="04"`
- **Título:** «Cómo viaja el error hacia atrás, y por qué importa por dónde empiezas»
- **Fuente:** `slides/Entrenamiento2.Rmd` (919 líneas). Léela completa.
- **Temario:** `Examenes/Examen1_Temario.md` §4.
- **Enlaza a 00:** `#regla-cadena` (imprescindible), `#derivadas` (tabla con sin, cos, exp, ReLU y sigmoide), `#vectores` (Ωᵀ, ⊙), `#probabilidad` (varianza) y `#sym-<clave>`. Enlaza a `02_redes_neuronales.html#profundas` (forma matricial de la red).

## Objetivo

Que el estudiante pueda (1) hacer backprop **a mano** en una cadena escalar pequeña y leer la recurrencia vectorial de δ; (2) explicar por qué la inicialización en cero falla y de dónde sale He (2/D_h); (3) distinguir ruido, sesgo y varianza, y dibujar e interpretar double descent.

## Secciones

1. **`mapa`:** tres necesidades para entrenar (gradientes eficientes, buena inicialización, optimizador estable); la clase 3 cubrió la tercera y esta cubre las otras dos más el desempeño.

2. **`por-que-backprop` · El problema.** La red como composición (las 4 ecuaciones de la slide con β y Ω) y el gradiente que necesita SGD. Por qué derivar a mano no escala: expresiones largas y cálculos repetidos.

3. **`backprop-escalar` · Backprop en una cadena escalar.**
   - Función de la slide: f = β₃ + ω₃ cos(β₂ + ω₂ exp(β₁ + ω₁ sin(β₀ + ω₀x))), con ℓ = (f − y)².
   - Forward como 8 pasos intermedios (f₀, h₁, f₁, h₂, f₂, h₃, f₃, ℓ).
   - **Elige valores numéricos** pequeños y redondos (por ejemplo x = 1, y = 0.5, todas las β = 0.1, todas las ω = 0.5 o similares; que ninguna cantidad explote). Calcula todo con node.
   - **Laboratorio «Grafo computacional»** (`DL.pasos` + nodos `.gnode`/`.garrow`): forward en naranja, nodo por nodo, con su valor; luego backward en verde con la derivada local de cada nodo y el gradiente acumulado. Al final, la tabla de ∂ℓ/∂ωₖ y ∂ℓ/∂βₖ para k = 0…3, con una columna de **comprobación numérica** por diferencias finitas, (ℓ(ω + h) − ℓ(ω − h))/2h, como en `notebooks/Entrenamiento2.ipynb`.
   - Derivación textual (`ol.deriv data-revelar`) de la cadena completa, nombrando las derivadas: d/dz sin = cos, d/dz exp = exp, d/dz cos = −sin.
   - Regla: ∂ℓ/∂ωₖ = (∂ℓ/∂fₖ)·hₖ y ∂ℓ/∂βₖ = ∂ℓ/∂fₖ, con h₀ = x. En `.note.good`: «el gradiente de un peso = el error que llega a su salida × lo que entró a ese peso».

4. **`backprop-relu` · La versión del examen: dos capas con ReLU.**
   - f₀ = β₀ + ω₀x, h₁ = ReLU(f₀), f₁ = β₁ + ω₁h₁, ℓ = (f₁ − y)².
   - **Laboratorio** con controles para x, y y los 4 parámetros: forward, backward y las 4 parciales en vivo. Cuando f₀ < 0, todo el lado izquierdo se pone en 0 y la neurona se marca «muerta para este ejemplo».
   - NO uses los números de B3 del examen de práctica (x = 1, y = 2, β₀ = 0.5, ω₀ = 1, β₁ = −1, ω₁ = 3) como ejemplo por defecto; usa otros.

5. **`backprop-vectorial` · La recurrencia vectorial.**
   - δₖ = ∂ℓ/∂fₖ; δₖ₋₁ = (Ωₖᵀ δₖ) ⊙ a′(fₖ₋₁); ∂ℓ/∂βₖ = δₖ; ∂ℓ/∂Ωₖ = δₖ hₖᵀ. Un `.formula` para cada una, con lectura: «el error de la capa de arriba se reparte hacia abajo según los mismos pesos (Ωᵀ) y solo pasa por las neuronas que estaban encendidas (⊙ 𝟙[f > 0])».
   - **Laboratorio** con `DL.matriz` y `DL.pasos`: red 2 → 3 → 1 con ReLU y números enteros pequeños. Recorre δ₁, el producto Ωᵀδ, la máscara ReLU y δ₀, y el producto exterior δ hᵀ con su forma.
   - Forward guarda y backward reutiliza, por eso hace falta memoria.
   - Diferenciación algorítmica en modo reverso, en dos párrafos.

6. **`gradientes-que-se-apagan` · Saturación y neuronas muertas.**
   - a′ para ReLU (0 o 1) y sigmoide (máximo 0.25).
   - **Mini-laboratorio:** producto de K derivadas de sigmoide en su mejor caso (0.25^K) contra ReLU activa (1^K), con un control de K de 1 a 20. Gráfica en escala log.

7. **`inicializacion` · Inicialización.**
   - **Ceros:** ruptura de simetría. **Mini-laboratorio:** red 1 → 2 → 1 con tanh y todos los pesos iguales a c (incluido 0). Al entrenar unos pasos, las dos neuronas ocultas reciben el mismo gradiente y siguen idénticas; con pesos aleatorios se separan. Con ReLU y pesos 0, los gradientes ocultos son 0.
   - **Laboratorio principal «Propagación de la varianza»:** red de 20 capas con D = 100, ReLU y un batch de 200 entradas N(0, 1). Pesos N(0, σ²_Ω) con σ²_Ω = c/D. Control de c (escala log) y botones «He (c = 2)», «demasiado chica (c = 1)», «demasiado grande (c = 3)», además de un selector de activación (ReLU o tanh) con el botón «Xavier». Gráfica de barras de la desviación estándar de las activaciones por capa (forward) y, en un segundo panel, la norma del gradiente por capa (backward con una pérdida simple, por ejemplo la media de la salida). Semilla fija. Verifica en node que con He la desviación se mantiene aproximadamente constante.
   - **Derivación de He** (`data-revelar`): f′ᵢ = Σⱼ Ωᵢⱼhⱼ; media 0; varianza de una suma de términos independientes = suma de varianzas = D_h·σ²_Ω·E[h²]; con ReLU y f simétrica, E[h²] = ½σ²_f (la mitad de la distribución se vuelve 0); igualar σ²_f′ = σ²_f ⇒ σ²_Ω = 2/D_h. En la explicación del ½, ayuda una figura de la campana con la mitad izquierda aplastada.
   - Backward: fan-out; Xavier 2/(D_in + D_out) como compromiso; reglas prácticas (ReLU → He; tanh/sigmoide → Xavier).

8. **`desempeno` · Ruido, sesgo y varianza.**
   - Las 6 fuentes de error de la slide; las dos preguntas (¿podemos optimizar? ¿generaliza?).
   - Definiciones de ruido, sesgo y varianza.
   - **Laboratorio «Muchos datasets»:** función verdadera sin(πx) en [−1, 1] con ruido σ = 0.3. Genera 30 datasets de n puntos (control de n) y ajusta polinomios del grado elegido (control). Dibuja los 30 ajustes en tenue y su promedio en fuerte. Muestra numéricamente sesgo², varianza y ruido. Mensaje: más grado → menos sesgo y más varianza; más n → menos varianza, mismo sesgo.
   - Cómo reducir cada uno (más datos ↔ varianza; más capacidad ↔ sesgo) y el trade-off clásico.

9. **`double-descent` · Double descent.**
   - Las tres zonas y el umbral de interpolación.
   - **Laboratorio «Double descent de verdad»:** regresión con p características aleatorias ReLU (random features) sobre n = 20 puntos de train de una función 1D con ruido, y test grande. Usa la solución de **norma mínima**: si p < n, mínimos cuadrados normales; si p ≥ n, w = Φᵀ(ΦΦᵀ + εI)⁻¹y con ε = 1e−8. Calcula el error de test promedio sobre unas 10 semillas para p = 1…80 (puede tardar unos cientos de ms; calcula una vez y guarda). Gráfica de error de train y de test contra p, en escala log, con una línea vertical en p = n. Un control que marca un p y muestra su ajuste en un segundo panel. **Verifica en node que aparece el pico cerca de p = n**; si no, ajusta el ruido o la escala de las características hasta que se vea, y documenta qué usaste.
   - Sesgo inductivo: entre muchas soluciones que interpolan, el algoritmo prefiere unas (aquí, la de norma mínima). Conecta con la regularización implícita de la clase 5.
   - Maldición de la dimensionalidad: un mini-cálculo con 10 puntos por eje → 10^d celdas.

10. **`hiperparametros` · Elegir hiperparámetros.** El proceso de 4 pasos; el test se usa una sola vez; por qué es costoso.

11. **`practica`** y **`glosario`**.

## Práctica (8 a 10)

- **Calcular:** forward y backward de la red escalar de 2 capas con ReLU (números distintos a los del examen de práctica), con las 4 parciales.
- **Calcular:** el mismo caso, pero con ω₀ de signo cambiado para que f₀ < 0. ¿Qué gradientes valen 0 y por qué?
- **Calcular:** un paso de la recurrencia vectorial con Ω (2×2), δ y f dados (incluye una entrada negativa en f).
- **Explicar:** ¿qué pasa si todos los pesos de una red profunda se inicializan en 0.5 (no en cero)? ¿Se rompe la simetría?
- **Calcular:** σ²_Ω de He para una capa con 512 entradas y la desviación estándar correspondiente (2/512 = 0.0039; σ ≈ 0.0625).
- **Predecir:** red de 30 capas tanh inicializada con He: ¿qué esperas de las activaciones? ¿Qué cambiarías?
- **Calcular:** ¿cuántas capas de sigmoide en su mejor caso hacen falta para que el gradiente se reduzca por debajo de 10⁻⁶? (0.25^K < 10⁻⁶ ⇒ K ≥ 10).
- **Diagnosticar:** con una tabla de error de train y test para 5 tamaños de modelo, ubica las zonas de double descent.
- **Explicar:** «más datos reduce el sesgo»: ¿verdadero o falso? Justifica.
- **Explicar:** ¿por qué el test se usa una sola vez?

## Glosario

Forward pass, backward pass, backpropagation, regla de la cadena, diferenciación automática (modo reverso), pre-activación, δ, gradiente que desaparece, gradiente que explota, neurona muerta, saturación, ruptura de simetría, fan-in, fan-out, inicialización He, inicialización Xavier, ruido, sesgo, varianza, umbral de interpolación, double descent, sesgo inductivo, maldición de la dimensionalidad.

## Avisos

- Aquí ℓ = (f − y)² sin ½ (en Repaso había ½). El 2 aparece en ∂ℓ/∂f₃ = 2(f₃ − y); dilo.
- Los índices de la slide (f₀ con β₀, Ω₀; h₁ = a(f₀)) están desfasados una posición respecto a las capas. Explícalo con un mini-diagrama: fₖ es lo que entra a la activación, y hₖ₊₁ lo que sale.
- La slide «Inicialización y backward pass» no da fórmulas: no inventes una derivación completa para fan-out; basta con la intuición simétrica.
- Notebook relacionado: `notebooks/Entrenamiento2.ipynb` (diagnósticos, comprobación numérica de gradientes y barrido de LR). Tarea relacionada: `tareas/Tarea4.ipynb` (sigmoide vs ReLU, BatchNorm).
