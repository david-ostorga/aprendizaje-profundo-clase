# Brief 01 · Intro y repaso de ML

- **Archivo:** `Explicaciones/01_repaso_ml.html` · `nav.serie data-actual="01"`
- **Título:** «Del aprendizaje supervisado al aprendizaje profundo»
- **Fuente:** `slides/Intro.Rmd` (326 líneas; solo lo conceptual: qué es DL, los 3 pilares, el pipeline y supervisado vs no supervisado) y **`slides/Repaso.Rmd` (918 líneas, el grueso)**. Léelas completas.
- **Temario:** `Examenes/Examen1_Temario.md` §1 (Repaso). Cópialo a tu cabeza: cada viñeta debe quedar cubierta.
- **Enlaza a 00:** `#sumas`, `#derivadas`, `#parciales`, `#probabilidad`, `#optimizar` y `#sym-<clave>`.

## Objetivo

Que el estudiante pueda escribir el problema de entrenamiento, derivar a mano el gradiente de la regresión lineal, hacer la aritmética de épocas, explicar de dónde sale la MSE (máxima verosimilitud) y usar bien train, validación y test. La regresión lineal es el «puente»: modelo → pérdida → gradiente → optimización, una estructura que no cambia en deep learning.

## Secciones

1. **`mapa`:** qué es aprendizaje profundo (red con ≥ 2 capas ocultas; los 3 pilares: datos, cómputo y autodiferenciación; el pipeline de 6 pasos). `.flow` del puente modelo → pérdida → gradiente → actualización.

2. **`problema` · El problema de entrenamiento.**
   - Los ingredientes: 𝒟_train, ℓ por observación, L(φ) = 1/n Σ ℓ y φ̂ = argmin L.
   - Bloque `.formula` completo para L(φ) y otro para φ̂.
   - Supervisado vs no supervisado en una tabla breve (Intro.Rmd).

3. **`regresion` · Regresión lineal.**
   - f(x, φ) = φ₀ + φ₁x y su versión multivariada wᵀx + b.
   - «z = wᵀx + b» como el ladrillo de toda red neuronal.
   - Pérdida cuadrática L(w, b) = 1/(2n) Σ (wᵀxᵢ + b − yᵢ)², con su `.formula` y la explicación del ½.
   - **Laboratorio «Ajusta la recta a mano»:** 11 puntos de la slide (x = 0, 0.2, …, 2; y = 0.50, 0.85, 1.00, 1.20, 1.35, 1.55, 1.65, 1.75, 1.90, 2.05, 2.20, el panel azul de Repaso.Rmd). Controles φ₀ y φ₁; cada residuo se dibuja como un cuadrado (`g.rect`) cuyo área es su contribución a la pérdida. Lectura de L en vivo. Botón «mostrar la mejor recta» (mínimos cuadrados).

4. **`descenso` · Gradient descent.**
   - **Derivación a mano** (`ol.deriv data-revelar`) de ∂L/∂φ₀ y ∂L/∂φ₁ para L = 1/n Σ (φ₀ + φ₁xᵢ − yᵢ)²: regla de la cadena dentro de la suma, la constante sale de la suma, etc. Es el primer ítem práctico del temario: hazla impecable.
   - Actualización φₜ₊₁ = φₜ − η∇L, con `.formula` y «¿qué pasa si η…?».
   - **Laboratorio «GD sobre la superficie»:** mapa de calor + contornos de L(φ₀, φ₁) con los mismos 11 puntos. Haz clic para elegir el inicio y usa un control para η. Botones «un paso» y «correr»; el camino se dibuja encima. Un panel a la derecha muestra la recta actual sobre los datos (segundo canvas pequeño). Al subir η debe verse la divergencia: encuentra con node el umbral real.

5. **`minibatch` · SGD, mini-batches y épocas.**
   - Las tres opciones (todos los datos, uno solo, mini-batch) con la fórmula de mini-batch SGD traducida. Tabla del compromiso: costo por paso, ruido, paralelización y memoria. «No hay un batch size universalmente óptimo».
   - Definición de época.
   - **Laboratorio «Calculadora de épocas»:** controles para n, |B| e iteraciones k. Muestra pasos por época = n/|B|, épocas = k·|B|/n, y una cuadrícula de n celdas que se colorea por mini-batch (inspirada en el laboratorio de minibatches de la guía original; impleméntala tú con `<div>`s). Incluye el caso con residuo, cuando n/|B| no es entero (el último batch es más chico).
   - Inicialización en cero: funciona en regresión lineal; en redes no (adelanto de la clase 4; enlaza a `04_entrenamiento2.html`).

6. **`por-que-iterar` · ¿Por qué no la fórmula cerrada ni la búsqueda exhaustiva?**
   - ŵ = (XᵀX)⁻¹Xᵀy existe para regresión lineal, pero las redes no tienen fórmula cerrada.
   - k^d combinaciones: **mini-laboratorio** con controles d y k que muestra k^d en notación científica («10^1000: hay ~10^80 átomos en el universo observable»).
   - Las dos razones del temario, en una `.note.exam`.

7. **`verosimilitud` · De dónde sale la pérdida cuadrática.**
   - yᵢ = wᵀxᵢ + b + εᵢ con ε ~ N(0, σ²).
   - **Derivación paso a paso** de −log p(**y**|X, w, b) = (n/2) log(2πσ²) + 1/(2σ²) Σ(…)². Nombra en cada paso la propiedad del log, la independencia que convierte el producto en suma, y por qué el primer término no depende de (w, b) y desaparece del argmin. El temario pide justo «qué término desaparece y por qué».
   - **Laboratorio «Campanas sobre la recta»:** los mismos puntos; una campana Normal vertical dibujada sobre cada punto, centrada en la recta, con controles φ₀, φ₁ y σ. Muestra lado a lado −log-verosimilitud y la suma de cuadrados: al mover la recta suben y bajan juntas. Al mover σ cambia el valor de −log L, pero NO la mejor recta.
   - Adelanto: Normal → MSE, Bernoulli → BCE, Categórica → CE (clase 3).

8. **`generalizacion` · Generalización.**
   - Riesgo empírico R̂_train vs riesgo de población R(f) (fórmula con integral traducida: «el promedio del error sobre todos los datos posibles, pesado por qué tan frecuentes son»).
   - f̂ = 𝒜(𝒟_train), y por qué evaluar en train es optimista.
   - Under/overfitting con R_train y R_test; brecha de generalización (generalization gap).
   - **Laboratorio «Grado del polinomio»:** 12 puntos de train y 200 de test generados con `DL.rng` a partir de sin(πx) + ruido. Control de grado de 0 a 11; ajuste por mínimos cuadrados (eliminación gaussiana en JS, x en [−1, 1] para que esté bien condicionado). Gráfica del ajuste y una segunda gráfica del error de train y de test por grado, con el grado actual marcado. Verifica en node que la curva de test tenga forma de U.
   - «DL complica la historia»: más parámetros ⇏ automáticamente más overfitting (adelanto de double descent, clase 4).

9. **`train-val-test` · Train, validación y test.**
   - Qué decide cada conjunto (parámetros / hiperparámetros / evaluación final). `.flow` de 3 nodos.
   - **Laboratorio «Elegir con el test»:** simulación con `DL.rng`. Hay 30 «modelos» cuya accuracy real es 70% para todos; cada uno se mide en un test de 200 ejemplos (ruido binomial). Si eliges el mejor según ese test, reporta ~76%; al medirlo en un test nuevo vuelve a ~70%. Botón «nueva simulación». Mensaje: usar el test para decidir lo vuelve validación.

10. **`l2` · Regularización L2 y weight decay.**
    - L_reg = (pérdida) + λ/2 ‖w‖².
    - **Derivación** de ∇_w (λ/2 ‖w‖²) = λw y de la reescritura w ← (1 − ηλ)w − η(…). El temario pide justo por qué se llama weight decay.
    - Por qué no se regulariza b.
    - **Mini-laboratorio:** con gradiente de datos = 0, w se multiplica por (1 − ηλ) en cada paso; control de η·λ y una gráfica de wₜ.
    - Remite a la clase 5 para el «por qué ayuda».

11. **`de-ml-a-dl` · Qué permanece y qué cambia.** El pipeline x → f → L → ∇L → actualización no cambia; f pasa a ser una composición de capas.

12. **`practica`** y **`glosario`**.

## Práctica (8 ejercicios; NO copies los de `Examen1_GuiaEstudio.md`, haz análogos)

- **Calcular:** épocas con n = 2 400, |B| = 32 y k = 1 500 iteraciones (pasos por época = 75; épocas = 20).
- **Calcular:** el caso inverso: con n = 1 000 y |B| = 64, ¿cuántas iteraciones son 5 épocas? (⌈1000/64⌉ = 16 pasos por época, así que 80 si el último batch incompleto cuenta; explica la convención).
- **Derivar:** ∂L/∂φ₀ y ∂L/∂φ₁ con 3 puntos concretos y un paso de GD con η = 0.1 (elige números y verifica).
- **Explicar:** dos razones para no usar la fórmula cerrada ni la búsqueda exhaustiva en DL.
- **Derivar:** a partir de la Normal, ¿qué término desaparece al minimizar sobre w y por qué? ¿Y si σ dependiera de x?
- **Diagnosticar:** con R_train y R_val de tres modelos, clasifica cada uno como subajuste, sobreajuste o razonable.
- **Diagnosticar:** «elegimos el learning rate viendo el test»: ¿qué está mal?
- **Calcular:** un paso de SGD con weight decay (η = 0.1, λ = 0.5, w = 2, gradiente de datos = 0.4 → w = (1 − 0.05)·2 − 0.04 = 1.86).

## Glosario

Aprendizaje supervisado, pérdida, riesgo empírico, riesgo de población, gradient descent, SGD, mini-batch, época, tasa de aprendizaje, máxima verosimilitud, negative log-likelihood, sobreajuste, subajuste, brecha de generalización, validación, test, weight decay.

## Avisos y erratas

- Repaso usa η para la tasa de aprendizaje; Entrenamiento usará α. Dilo.
- La L de la slide «Función de pérdida» lleva 1/(2n), pero la de Interpretación probabilística usa la suma sin 1/n. Explica que escalar por una constante no cambia el argmin.
- Notebook relacionado: `notebooks/Intro_Pytorch.ipynb` (enlace opcional; ya hay una guía de código en `guia_intro_pytorch.html`; enlázala, no la repitas).
