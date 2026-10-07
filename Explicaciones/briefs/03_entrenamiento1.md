# Brief 03 · Entrenamiento 1: funciones de pérdida y optimizadores

- **Archivo:** `Explicaciones/03_entrenamiento1.html` · `nav.serie data-actual="03"`
- **Título:** «De dónde salen las pérdidas y cómo se minimizan»
- **Fuente:** `slides/Entrenamiento.Rmd` (799 líneas). Léela completa.
- **Temario:** `Examenes/Examen1_Temario.md` §3.
- **Enlaza a 00:** `#funciones` (log, exp, sigmoide, softmax), `#probabilidad`, `#optimizar`, `#sumas`, `#parciales` y `#sym-<clave>`. Enlaza a `01_repaso_ml.html#verosimilitud` (ahí ya se derivó Normal → MSE con regresión lineal; aquí se generaliza a cualquier f).

## Objetivo

Primera mitad: la **receta** para construir cualquier pérdida (elegir una distribución → la red predice sus parámetros → máxima verosimilitud → minimizar la NLL), con las tres derivaciones y la capacidad de **diseñar una pérdida nueva**. Segunda mitad: qué problema resuelve cada optimizador (SGD, momentum, Nesterov, Adam) y sus actualizaciones traducidas.

Este es el artefacto con más derivaciones. Cada `ol.deriv` debe ser impecable: una operación por paso y la regla nombrada.

## Secciones

1. **`mapa`:** Repaso dijo «la MSE sale de una Normal»; aquí se convierte en receta general. `.note.key`: «la red no predice y; predice los parámetros de una distribución sobre y».

2. **`receta` · La receta en cuatro pasos.**
   - `.flow` con x → f(x, φ) → θ → P(y | θ).
   - Máxima verosimilitud: producto (por qué i.i.d.) → log (por qué no cambia el argmax; enlaza a `00_matematicas.html#optimizar`) → negativo (por convención se minimiza).
   - Un `.formula` por cada uno de los tres pasos.
   - Paso 4: en inferencia se devuelve la distribución o un resumen de ella.

3. **`normal` · Ejemplo 1: regresión → MSE.**
   - Derivación completa (`data-revelar`): la NLL con la Normal, luego las propiedades del log, y por qué con σ² constante el primer término es una constante.
   - Supuestos (independencia, normalidad, varianza constante, media = f).
   - **Heteroscedasticidad:** la red predice μ(x) y σ²(x); hay que garantizar σ² > 0 (cuadrado, exp o softplus). **Laboratorio:** datos con ruido que crece con x (`DL.rng`), recta con banda ±2σ(x). Un selector entre «σ constante» y «σ(x) aprendida» (calcula ambos ajustes con unos pasos de GD o con la fórmula cerrada para la media y un modelo lineal en log σ) y muestra la NLL de cada uno.

4. **`bernoulli` · Ejemplo 2: clasificación binaria → BCE.**
   - Bernoulli (las dos escrituras: por casos y como (1 − λ)^(1−y) λ^y; explica el truco del exponente con y = 0 y y = 1).
   - Problema: f ∈ ℝ y λ ∈ [0, 1], así que se usa la sigmoide.
   - Derivación de la BCE.
   - **Laboratorio «sigmoide + BCE»:** control del score f. Muestra λ = σ(f) y las dos curvas de pérdida en función de λ: −log λ (si y = 1) y −log(1 − λ) (si y = 0). Un selector y ∈ {0, 1}. Mensaje: equivocarse con mucha confianza cuesta muchísimo.
   - Inferencia con umbral de 0.5 y la advertencia de calibración de la slide.

5. **`categorica` · Ejemplo 3: multiclase → cross-entropy.**
   - Categórica + softmax. Derivación, incluida la forma log Σ exp − f_{yᵢ}.
   - **Laboratorio:** 4 controles de score; barras de probabilidad (softmax); selector de la clase correcta; pérdida = −log p(clase correcta) en vivo.
   - Inferencia con argmax.

6. **`disenar` · Diseña tu propia pérdida.**
   - El temario pide diseñar una pérdida para un problema nuevo. Ejemplo resuelto: **conteos con Poisson** (Tarea 3: peatones por minuto). P(y | λ) = λʸ e^(−λ)/y!; λ > 0 ⇒ λ = e^f; derivación de la NLL = Σ [e^(f(xᵢ, φ)) − yᵢ·f(xᵢ, φ) + log(yᵢ!)]; el último término no depende de φ.
   - **Laboratorio «Asistente de diseño»** (`DL.pasos` + `DL.selector`): eliges un tipo de dato (real, real positivo, binario, K clases, conteo, proporción en [0, 1], varias etiquetas) y el asistente recorre la receta: distribución sugerida, restricción del parámetro, función de enlace (identidad, exp/softplus, sigmoide, softmax) y NLL simplificada. Usa las distribuciones del formulario del examen (`Examenes/Examen1_GuiaEstudio.md`, al final). No incluyas el caso «tiempo de espera / exponencial», porque es la pregunta B2 del examen de práctica.
   - **Salidas múltiples:** independencia condicional ⇒ la pérdida se suma por dimensión; cuándo falla (etiquetas correlacionadas).

7. **`entropia` · Cross-entropy y KL.**
   - D_KL(q‖p) = −H(q) + H(q, p), derivado paso a paso.
   - Por qué minimizar KL = minimizar H(q, p): H(q) no depende de φ.
   - One-hot ⇒ H = −log p(yᵢ | xᵢ) = NLL.
   - Ejemplo numérico con q = (0, 1, 0) y p = (0.2, 0.7, 0.1).

8. **`no-convexo` · Optimización: el paisaje no es un tazón.**
   - GD repaso. Convexo vs no convexo: mínimos locales, puntos silla y regiones planas.
   - **Laboratorio «Gabor»:** modelo f(x, φ) = sin(φ₀ + 0.06φ₁x)·exp(−(φ₀ + 0.06φ₁x)²/32). Genera datos con DL.rng a partir de unos parámetros verdaderos (elige unos que den un paisaje con varios mínimos; inspírate en la figura Gabor1.png). Mapa de calor + contornos de L(φ₀, φ₁); clic = inicio; GD con η ajustable. Distintos inicios terminan en distintos mínimos. Verifica en node que haya al menos 2 mínimos locales visibles.

9. **`sgd` · SGD.**
   - Mini-batch SGD traducido; el gradiente del batch es una estimación ruidosa del gradiente total.
   - Propiedades (las 5 de la slide).
   - **Laboratorio:** sobre el mismo paisaje Gabor, GD contra SGD (gradiente de un mini-batch de tamaño elegible) desde el mismo inicio. Mensaje: el ruido a veces escapa de un mínimo malo o de una región plana; con η constante oscila cerca del mínimo.

10. **`momentum` · Momentum y Nesterov.**
    - Fórmulas de la slide (forma de promedio móvil: m ← βm + (1 − β)g) traducidas: «m es la dirección promedio reciente».
    - Nesterov: el gradiente se evalúa en el punto adelantado φ − αβm.
    - `.formula` para cada una.

11. **`adam` · Métodos adaptativos y Adam.**
    - Problema: coordenadas con escalas de gradiente muy distintas. Normalización por coordenada (g/√v).
    - Adam = momentum + normalización + corrección de sesgo. Cada fórmula con `.formula`.
    - **Tabla de la corrección de sesgo:** con g constante = 1, β₁ = 0.9 y β₂ = 0.999, valores de mₜ, vₜ, m̂ₜ y v̂ₜ para t = 1…5. Muestra que sin corregir el paso inicial es diminuto. Calcula con node.

12. **`carrera` · Laboratorio: carrera de optimizadores.**
    - Superficie 2D mal condicionada (por ejemplo L = ½(φ₀² + 20φ₁²) rotada 30°, o un valle tipo Rosenbrock suave).
    - GD, momentum, Nesterov y Adam salen del mismo punto clicado, cada uno con su color (g1…g4) y su camino.
    - Controles: α (uno para todos o uno por método), β y casilla «ruido de mini-batch».
    - Lectura de la pérdida de cada uno por paso, más una gráfica pequeña de pérdida contra paso en escala log.
    - **Qué observar:** GD zigzaguea en el valle; momentum avanza pero se pasa; Nesterov se pasa menos; Adam avanza parejo en ambas coordenadas.

13. **`practica`** y **`glosario`**.

## Práctica (8 a 10)

- **Derivar:** la BCE desde la Bernoulli + sigmoide, sin ver la sección.
- **Derivar:** diseña la pérdida para la proporción de votos de un partido por casilla, y ∈ (0, 1). Por ejemplo con una Beta: dos parámetros positivos predichos con exp. Si prefieres algo más simple, una Bernoulli sobre votos individuales; explica el trade-off.
- **Derivar:** la NLL de Poisson simplificada, y por qué desaparece log(y!).
- **Explicar:** en regresión heteroscedástica, ¿qué pasa si la red predice σ² directamente con una salida lineal?
- **Calcular:** la CE con scores (2, 0, −1) cuando la clase correcta es la 2 (verifícalo en node).
- **Explicar:** por qué minimizar la KL es lo mismo que minimizar la cross-entropy.
- **Calcular:** dos pasos de momentum a mano con g₁ = 1, g₂ = 1, β = 0.9, α = 0.1, m₀ = 0.
- **Calcular:** m̂₁ de Adam con g₁ = 4, β₁ = 0.9 (m₁ = 0.4 y m̂₁ = 4): explica para qué sirve la corrección.
- **Predecir:** un parámetro con gradientes siempre ~100 veces más grandes que otro. ¿Qué hace SGD? ¿Y Adam?
- **Explicar:** qué puede hacer el ruido de SGD que GD determinista no.

## Glosario

Máxima verosimilitud, likelihood, log-likelihood, NLL, distribución condicional, i.i.d., función de enlace, sigmoide, softmax, BCE, cross-entropy, KL, heteroscedasticidad, convexo, mínimo local, punto silla, momentum, Nesterov, método adaptativo, Adam, corrección de sesgo.

## Avisos

- La slide usa α para la tasa de aprendizaje (Repaso usaba η). Dilo una vez.
- **Momentum:** la slide usa la forma de promedio móvil, m ← βm + (1 − β)g. PyTorch (`torch.optim.SGD(momentum=…)`) usa m ← βm + g, que equivale a reescalar la tasa de aprendizaje por 1/(1 − β). Pon una `.note.fix`: en el examen, la forma de la slide.
- Notebook relacionado: `notebooks/Optimizadores.ipynb` (enlace opcional). Tarea relacionada: `tareas/Tarea3.ipynb` (Poisson y normalización de targets).
