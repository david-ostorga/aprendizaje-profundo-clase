# Brief 02 · Redes neuronales superficiales y profundas

- **Archivo:** `Explicaciones/02_redes_neuronales.html` · `nav.serie data-actual="02"`
- **Título:** «Redes neuronales: funciones hechas de pedazos de recta»
- **Fuente:** `slides/NN.Rmd` (859 líneas). Léela completa, incluidos los chunks de R: tienen los parámetros exactos de las figuras.
- **Temario:** `Examenes/Examen1_Temario.md` §2.
- **Enlaza a 00:** `#funciones` (ReLU), `#vectores`, `#sumas`, `#griegas` (subíndices dobles como θ₂₁) y `#sym-<clave>`.

## Objetivo

Que el estudiante vea la red ReLU como una **suma de «codos»**: pueda trazar a mano una red 1-3-1, ubicar las articulaciones, calcular pendientes, contar parámetros y regiones, y explicar por qué la profundidad es eficiente sin ser necesaria para la aproximación universal.

## Secciones

1. **`mapa`:** de la regresión lineal (una recta) a la red (muchas rectas pegadas). Idea central en `.note.key`: «cada neurona ReLU agrega un codo; la red suma codos».

2. **`superficial` · La red superficial 1-3-1.**
   - La ecuación completa y luego reescrita con h₁, h₂, h₃. `.formula` para y = φ₀ + φ₁h₁ + φ₂h₂ + φ₃h₃ y otro para h_d = a(θ_d0 + θ_d1 x). Explica la lectura de θ₂₁ («neurona 2, peso de x»).
   - ReLU: gráfica y definición.
   - 10 parámetros, «una familia de funciones».
   - **Laboratorio principal «Construye la red en 4 pasos»** (el más importante del artefacto):
     - Pestañas (`.modetabs`) para los 4 pasos de la slide: (1) tres rectas θ_d0 + θ_d1 x; (2) ReLU de cada una; (3) multiplicadas por φ_d; (4) suma + φ₀.
     - 10 controles de parámetros. Arranca con los de la slide: θ = (−0.2, 0.3), (−0.8, 0.7), (1.0, −0.8); φ = (0, −0.5, 0.8, 0.6); x ∈ [0, 2].
     - Tabla en vivo: articulaciones (x = −θ_d0/θ_d1, solo las que caen en el rango), neuronas activas en cada región y pendiente de cada región (suma de φ_d·θ_d1 de las activas).
     - Selector de activación: ReLU, identidad, escalón (heaviside), tanh y rect (Tarea 2, pregunta 1). Con la identidad, el texto debe decir «colapsa a una recta».
     - Botón «parámetros de la Tarea 2»: θ₁₀ = 0.3, θ₁₁ = −1.0, θ₂₀ = −1.0, θ₂₁ = 2.0, θ₃₀ = −0.5, θ₃₁ = 0.65, φ₀ = −0.3, φ₁ = 2.0, φ₂ = −1.0, φ₃ = 7.0, en x ∈ [0, 1].
   - **Derivación** de por qué cada región es una recta: dentro de una región cada h_d es 0 o una recta, y una suma de rectas es una recta. Por qué hay a lo más D + 1 regiones.

3. **`invarianzas` · Dos propiedades que vienen en el examen.**
   - (a) Activación lineal ⇒ la red entera es lineal (derivación de 3 pasos).
   - (b) Homogeneidad de ReLU: ReLU(c·z) = c·ReLU(z) para c > 0. Por eso multiplicar (θ_d0, θ_d1) por c y dividir φ_d entre c da la MISMA función: distintos φ, misma función.
   - **Mini-laboratorio:** un control de c que reescala la neurona 2. La gráfica no se mueve y los parámetros sí; con c < 0, cambia.

4. **`aproximacion` · Teorema de aproximación universal.**
   - Enunciado traducido.
   - **Laboratorio:** aproximar cos(πx) en [0, 2] con D neuronas (control de 1 a 30). Construye la red que interpola D + 1 nodos equiespaciados con ReLUs: y = f(0) + m₀x + Σₖ (mₖ − mₖ₋₁)·ReLU(x − xₖ). Es una construcción real; muestra los parámetros resultantes y el error máximo. Mensaje: más neuronas → más codos → mejor aproximación.

5. **`dimensiones` · Más entradas y más salidas.**
   - Salidas múltiples: misma capa oculta y dos combinaciones, así que las articulaciones caen en los mismos lugares.
   - Entradas 2D: cada neurona es un plano, la ReLU lo recorta a lo largo de una recta y la suma da regiones poligonales.
   - **Laboratorio:** red 2-3-1 con mapa de calor de y(x₁, x₂) y las 3 rectas donde θ_d0 + θ_d1 x₁ + θ_d2 x₂ = 0 dibujadas encima, con controles para unos cuantos parámetros. Un contador de regiones (cuenta patrones distintos de neuronas activas en una malla fina).
   - Caso general h_d = a(θ_d0 + Σᵢ θ_di xᵢ), y_j = φ_j0 + Σ_d φ_jd h_d con `.formula`.

6. **`contar` · Contar parámetros y regiones.**
   - Fórmulas traducidas: red superficial (D_i + 1)·D + (D + 1)·D_o; red profunda con K capas de D neuronas, 1 entrada y 1 salida: 3D + 1 + (K − 1)·D·(D + 1) (deriva de dónde sale cada término). Regiones: D + 1 (superficial, 1D), hasta (D + 1)^K (profunda), y Zaslavsky para D_i ≥ 2 en un `<details>` «Para profundizar».
   - **Laboratorio «Calculadora»:** controles para D_i, D, D_o y K. Muestra el número de parámetros con el desglose por capa y las regiones máximas (1D). Incluye el caso de la slide: D = 500, D_i = 100 → 51 001 parámetros.

7. **`profundas` · Redes profundas: componer es doblar.**
   - Pegar dos redes 1-3-1: la primera «dobla» el eje x y la segunda se aplica sobre el doblez. Con los mismos 20 parámetros salen 9 regiones o más (hasta 16), contra a lo más 7 de una red superficial con 6 neuronas y 19 parámetros.
   - **Laboratorio «Doblar»:** tres paneles: y = red1(x), y′ = red2(y) y la composición y′(x). Un punto x movible muestra a qué y y a qué y′ va, y varios x distintos caen en el mismo y′. Contador de regiones de la composición, detectadas numéricamente por cambios de pendiente.
   - Escribir las dos redes en una ecuación (ψ) y en forma matricial: h₁ = a(β₀ + Ω₀x), h₂ = a(β₁ + Ω₁h₁), y = β₂ + Ω₂h₂. Bloque `.formula` con las formas de cada matriz.
   - Hiperparámetros (K, D_k) vs parámetros (φ, θ, Ω, β): quién decide cada uno y cuándo.

8. **`superficial-vs-profunda` · Comparación.** La tabla de la slide y las tres cajas: aproximación universal ≠ eficiencia representacional; más profundidad ⇏ entrenamiento más fácil; buena optimización ≠ buena generalización. Una `.note.exam` para cada una.

9. **`practica`** y **`glosario`**.

## Práctica (8 a 10 ejercicios; NO copies B1 de `Examen1_GuiaEstudio.md`, haz análogos)

- **Trazar:** con los parámetros de la Tarea 2, evalúa h₁, h₂, h₃ y y en x = 0, 0.25, 0.5, 0.75 y 1; ubica las articulaciones y la pendiente de cada región. Calcula con node.
- **Trazar:** una red 1-2-1 inventada con números enteros (como B1 del examen, pero distinta): articulaciones, regiones y pendientes.
- **Predecir:** ¿qué le pasa a la función si sumas 0.5 a φ₀? ¿Y si multiplicas φ₁, φ₂, φ₃ por 0.5? (Tarea 2, 3a y 3b).
- **Explicar:** activación identidad ⇒ recta. Demuéstralo con la red 1-2-1.
- **Explicar:** reescalamiento de ReLU con c = 3: ¿cambia y(x)? ¿Y con c = −1?
- **Calcular:** parámetros de una red 3-4-2 (3·4 + 4 = 16 en la capa oculta y 4·2 + 2 = 10 en la salida: 26 en total).
- **Calcular:** parámetros y regiones máximas de una red profunda 1 → (K = 3 capas de D = 4) → 1 (3·4 + 1 + 2·4·5 = 53 parámetros; hasta 5³ = 125 regiones) contra una superficial con un número parecido de parámetros (D = 17 da 52 parámetros y 18 regiones).
- **Explicar:** «si una red superficial ya es un aproximador universal, ¿para qué la profundidad?».
- **Predecir:** dos redes con las mismas regiones y distintos parámetros: ¿pueden ser la misma función?

## Glosario

Neurona (unidad oculta), pre-activación, activación, ReLU, articulación (codo), región lineal, red superficial, red profunda, capa, ancho, profundidad, hiperparámetro, aproximación universal, eficiencia representacional, homogeneidad no negativa.

## Erratas conocidas de NN.Rmd (corrígelas en silencio, son typos)

- Slide «Inputs >> 1D», h₃ = a(θ₃₀ + θ₃₁x₁ + **θ₂₃**x₂): debe ser θ₃₂.
- Slide «Pegando dos redes», y′ = φ′₀ + φ′₁**h₁** + …: deben ser h′₁, h′₂, h′₃.
- Slide «Número de regiones»: «con dos inputs y tres outputs hay 7 polígonos». Por contexto son 3 **neuronas** ocultas; verifícalo con tu laboratorio 2D.
- El comentario de la slide «Caso general» cuenta 20 = 3·4 + 4·2, es decir, solo pesos. Con sesgos son 26. En el texto distingue «pesos» de «parámetros».
- En el chunk «Paso 1» la segunda recta usa pendiente 0.9 en la figura y 0.7 en la etiqueta. Usa los valores de los chunks «Paso 2» a «Paso 4»: (−0.8, 0.7).
