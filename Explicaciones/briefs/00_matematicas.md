# Brief 00 · Matemáticas y notación del curso

- **Archivo:** `Explicaciones/00_matematicas.html` · `nav.serie data-actual="00"`
- **Título:** «Las matemáticas del curso, traducidas»
- **Fuente:** todas las slides de las semanas 1 a 5 (`slides/Repaso.Rmd`, `NN.Rmd`, `Entrenamiento.Rmd`, `Entrenamiento2.Rmd`, `Regularizacion.Rmd`). No hace falta que las leas completas; ojea las fórmulas para ver cómo se escriben. El diccionario `_compartido/notacion.js` ya tiene los símbolos.
- **Papel en la serie:** es la base de consulta. Los otros cinco artefactos enlazan aquí (`00_matematicas.html#sym-<clave>` y `#<id-de-sección>`), así que **los ids de las secciones de abajo son fijos**: no los cambies.

## Objetivo

Que el estudiante pueda **leer en voz alta** cualquier fórmula del curso y saber qué tipo de cosa es cada símbolo. No es un curso de cálculo: es un traductor, con solo las herramientas que el curso usa de verdad. Cada herramienta lleva un ejemplo del curso que la usa («esto aparece cuando derivamos la MSE en la clase 3»).

Tono de la portada: la notación es un idioma comprimido, no una prueba de inteligencia. Quien entiende la intuición ya tiene la mitad; aquí se aprende a leer la otra mitad.

## Secciones (ids fijos)

1. **`mapa` · Cómo usar este artefacto.** Dos modos: lectura de principio a fin (unos 60 minutos) o consulta (índice, tabla de notación, explicaciones al pasar el cursor). `.flow` con las cinco clases y qué herramienta matemática pesa más en cada una: Repaso → derivadas y Σ; NN → funciones y matrices; Entrenamiento 1 → log, exp y probabilidad; Entrenamiento 2 → regla de la cadena y varianza; Regularización → norma y prior.

2. **`leer-formulas` · Cómo leer una fórmula en 5 pasos.**
   1. ¿Qué se calcula? (el lado izquierdo).
   2. Clasifica cada símbolo por rol (explica la convención de colores; incluye `.leyenda-roles`).
   3. Lee subíndices y superíndices.
   4. Sustituye números pequeños.
   5. Pregunta «¿qué pasa si este número sube?».
   - **Laboratorio «Lector de fórmulas»** (`DL.pasos` + `DL.selector`): eliges una de 4 fórmulas reales del curso. El laboratorio la recorre pieza por pieza: resalta un fragmento y explica qué es, su rol y cómo se lee. Al final muestra la frase completa en español. Fórmulas:
     - L(φ) = 1/n Σ ℓ(f(xᵢ, φ), yᵢ)
     - φₜ₊₁ = φₜ − η ∇L(φₜ)
     - h₁ = a(θ₁₀ + θ₁₁x)
     - L(φ) = −Σ log P(yᵢ | f(xᵢ, φ))
   - Implementación sugerida: cada fórmula es un arreglo de piezas `{t: texto HTML, rol, explicacion}`. La fórmula se pinta con `<span>` y la pieza activa lleva la clase `.cell.hl` o un fondo de acento.

3. **`griegas` · Letras griegas y convenciones.** Tabla de las griegas que usa el curso, con su lectura y su papel (puedes usar `<div data-tabla-notacion data-grupo="parametros">` y `data-grupo="hiper"`, pero explica antes con prosa).
   - Convenciones: el gorrito ^ significa «estimado» (ŷ, φ̂, x̂).
   - Subíndices: xᵢ (observación i), θ₂₁ (neurona 2, peso de x), φₜ (paso t), Ωₖ (capa k).
   - Superíndices: x² es potencia, pero Σ lleva límites arriba y abajo. Un subíndice NO es una potencia.
   - Mayúsculas y negritas para vectores y matrices.
   - f(x, φ): lo de antes de la coma es el dato y lo de después, los parámetros.
   - Símbolos con doble significado: β, λ, σ, K y p. Cuadro explícito con «cómo saber cuál es por el contexto».

4. **`sumas` · Sumas (Σ) y productos (Π).**
   - Lectura de Σ con sus límites. El promedio 1/n Σ.
   - Tres propiedades que se usan en las derivaciones: una constante sale de la suma; la suma de una suma se separa; Σ de una constante = n · constante.
   - Π, y por qué la verosimilitud es un producto (i.i.d.).
   - **Laboratorio «Expansor de Σ»:** 5 puntos (xᵢ, yᵢ) fijos y una recta con controles φ₀ y φ₁. Muestra Σ(ŷᵢ − yᵢ)² desplegada término por término: «(0.84 − 0.50)² + (… )² + …», cada término con su valor y su color, y el total. Un selector cambia entre suma y promedio.

5. **`funciones` · Las funciones que usa el curso.**
   - Recta, exp, log, ReLU, sigmoide, tanh y softmax. Para cada una: gráfica, rango de salida («¿qué números puede devolver?») y para qué la usa el curso (exp: garantizar positivos; sigmoide: probabilidad; softmax: K probabilidades que suman 1).
   - **Laboratorio «Galería de funciones»:** selector de función y una gráfica con el punto z (control) y su salida.
   - **Laboratorio «softmax»:** tres controles de score (z₁, z₂, z₃) y barras con las probabilidades. Botón «sumar 5 a todos» que muestra que no cambian (solo importan las diferencias).
   - Propiedades de log y exp en una tabla: log(a·b), log(a/b), log(aᵇ), log(eᶻ) = z, e^(a+b). Para cada una, dónde aparece en el curso.
   - **Laboratorio «por qué log»:** producto de n probabilidades de 0.5 contra la suma de sus logs, con n de 1 a 2000. Muestra que el producto se vuelve 0 en la computadora (subdesbordamiento cerca de n ≈ 1075) y la suma de logs no. Verifica el umbral con node.

6. **`derivadas` · Derivadas: la pendiente.**
   - Derivada = pendiente de la recta tangente = «si muevo x un poquito, cuánto cambia f».
   - **Laboratorio «tangente»:** f(x) = x² − 2x + 2 (o selector con 3 funciones). Un control para x muestra la tangente y su pendiente; un botón alterna con la pendiente aproximada [f(x+h) − f(x)]/h para h = 0.5, 0.1 y 0.01.
   - Tabla de derivadas que el curso usa: constante, xⁿ, eˣ, log x, sin, cos, ReLU (𝟙[z > 0]), sigmoide (σ(z)(1 − σ(z))), y (a − y)² respecto de a. Cada una con un ejemplo numérico.
   - **`regla-cadena` · Regla de la cadena.** Analogía de engranajes: si A gira 3 veces más rápido que B y B 2 veces más rápido que C, A gira 6 veces más rápido que C. Ejemplo: y = (3x + 1)². Derivación con `ol.deriv data-revelar`. Laboratorio pequeño con `DL.pasos`: x = 2 → u = 3x + 1 = 7 → y = u² = 49; luego hacia atrás, dy/du = 14, du/dx = 3, dy/dx = 42. Verificación numérica con h pequeña. Anuncia que esto ES backprop (clase 4).
   - **`parciales` · Derivada parcial y gradiente.** ∂ = derivar respecto a uno, con los demás congelados. Ejemplo: L(φ₀, φ₁) = (φ₀ + 2φ₁ − 3)².
     - **Laboratorio:** mapa de calor + contornos de esa L. Al hacer clic en un punto se dibuja el vector gradiente (flecha cuesta arriba) y su opuesto (cuesta abajo), con los valores de ∂L/∂φ₀ y ∂L/∂φ₁. Usa `g.mapaCalor`, `g.contornos`, `g.flecha` y `g.alPuntero`.
     - Mensaje: el gradiente apunta hacia donde L sube más rápido; por eso los optimizadores RESTAN.

7. **`vectores` · Vectores y matrices.**
   - Vector, producto punto wᵀx paso a paso, matriz por vector (cada fila es un producto punto), formas (n, d)·(d, 1) → (n, 1) y la regla «el número de en medio debe coincidir y desaparece».
   - Transpuesta, ⊙ y la norma ‖w‖² = Σ wⱼ².
   - **Laboratorio** con `DL.pasos` + `DL.matriz`: Ω (3×2) por x (2×1) más β (3×1), seguido de ReLU elemento a elemento. Es exactamente una capa de la red de la clase 2. Valores enteros pequeños; en el último paso, una entrada se apaga por la ReLU.

8. **`probabilidad` · Probabilidad y distribuciones.**
   - Variable aleatoria y P(y | x) («la barra se lee dado»). Distribución = «qué valores puede tomar y qué tan probable es cada uno».
   - Normal, Bernoulli, Categórica y Poisson: soporte, parámetros, fórmula traducida y cuándo se usa. Conviene una tabla con el estilo del formulario del examen (ver `Examenes/Examen1_GuiaEstudio.md`, al final).
   - **Laboratorio «La campana»:** Normal con controles de μ y σ, más un punto observado y. Muestra la altura de la curva en y (la verosimilitud de ese dato) y −log de esa altura. Mensaje: «verosimilitud alta = el dato cae donde la campana es alta», y una σ chica premia mucho los aciertos y castiga mucho los errores. Prepara la clase 3.
   - i.i.d. → producto. E[·] y Var(·) con un ejemplo de dado. ~ («se distribuye como»).

9. **`optimizar` · argmin, argmax y «minimizar».** Diferencia entre min L (un número) y argmin L (el punto donde ocurre). Por qué maximizar f es lo mismo que minimizar −f, y por qué aplicar log no cambia el argmax (función creciente). Ejemplo con una parábola. Esta sección es la base del paso «max verosimilitud → min −log» que aparece en tres clases.

10. **`notacion` · Tabla de notación completa.** Prosa corta y luego `<div data-tabla-notacion data-grupo="X">` por grupo, con un `h3` para cada uno: datos, parametros, hiper, calculadas, funciones, operadores, probabilidad. Las filas tienen id `sym-<clave>` y las demás páginas enlazan ahí. **Esta sección es obligatoria y su id es fijo.**

11. **`practica`** y **`glosario`** (ver abajo).

## Práctica (8 ejercicios)

- **Explicar:** lee en voz alta φₜ₊₁ = φₜ − α · 1/|Bₜ| Σ_{i∈Bₜ} ∇ℓᵢ(φₜ) y clasifica cada símbolo por rol.
- **Calcular:** despliega Σ_{i=1}^{3} (2i − 1) y calcula el valor (1 + 3 + 5 = 9).
- **Calcular:** wᵀx con w = (2, −1, 0.5) y x = (1, 4, 2) (2 − 4 + 1 = −1).
- **Calcular:** forma del resultado de Ω (4×3) · h (3×1), y cuántos productos punto se hacen.
- **Derivar:** dy/dx de y = e^(2x+1) en x = 0 con la regla de la cadena (2e ≈ 5.437).
- **Derivar:** ∂/∂φ₁ de (φ₀ + φ₁x − y)² (respuesta simbólica).
- **Calcular:** softmax(0, 1, 2), con 3 decimales (0.090, 0.245, 0.665).
- **Explicar:** por qué argmax de Π P es igual a argmin de −Σ log P.

Verifica todos los números con node antes de escribirlos.

## Glosario

Producto punto, derivada, derivada parcial, gradiente, regla de la cadena, verosimilitud, i.i.d., distribución, función de activación, argmin, norma.

## Avisos

- Este artefacto NO enseña deep learning; cada sección dice dónde reaparece la herramienta («→ clase 3, Ejemplo 2»). Esos enlaces apuntan a archivos que todavía no existen (01–05): está bien, `revisar.py` solo da un aviso.
- Mantén la extensión: es mejor un ejemplo bien elegido que tres.
