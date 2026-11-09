# Brief 07 · Redes recurrentes y modelos de lenguaje

- **Archivo:** `Explicaciones/07_rnn.html` · `nav.serie data-actual="07"`
- **Título:** «Redes recurrentes: memoria, gradientes a través del tiempo y modelos de lenguaje»
- **Fuente:** `slides/RNN.Rmd` (1 140 líneas). Léela completa.
- **Temario:** `Examenes/Examen2_Temario.md` §2 (Redes recurrentes y modelos de lenguaje) y, para la Parte C, §5 (split por tiempo). Tarea relacionada: `tareas/Tarea7.ipynb` (RNN vs LSTM vs GRU, SGD vs Adam, perplejidad). Notebook de clase: `notebooks/NotebookRNN.ipynb`.
- **Enlaza a 00:** `#producto` (Π), `#log-exp` (log de un producto), `#regla-cadena`, `#softmax`, `#vectores` (norma), `#probabilidad` (condicional, E y Var) y `#sym-<clave>`. Enlaza a `03_entrenamiento1.html#categorica` y `#entropia` (cross-entropy), a **`04_entrenamiento2.html#backprop-escalar` y `#gradientes-que-se-apagan`** (BPTT es backprop sobre la red desenrollada; el producto de factores ya apareció ahí), a `02_redes_neuronales.html#contar-parametros` y a `05_regularizacion.html#early-stopping` / `#diagnostico` (validación y diagnóstico).
- **Imágenes de la slide** que pueden ayudar (ruta `../images/`): `hiddenstate.png`, `gates.png`, `lstmMC.png`, `GRU.png`, `bidereccional.png`. Úsalas con moderación y lístalas en el reporte.

## Objetivo

Que el estudiante entienda cómo se modela una **secuencia**: primero contando (n-gramas, con sus ceros y su smoothing) y evaluando con **perplejidad**; luego con un **estado oculto** que resume el pasado (RNN simple con parámetros compartidos). Que vea, con números, por qué entrenar una RNN con **BPTT** multiplica muchos factores (0.9¹⁰⁰ ≈ 0.00003 contra 1.1¹⁰⁰ ≈ 13 781), qué arregla el **gradient clipping** (explosión) y qué no (desvanecimiento), y cómo las **compuertas** de LSTM y GRU crean un camino aditivo por el que la memoria y el gradiente sobreviven muchos pasos. Cierra con bidireccionalidad (cuándo sí y cuándo no) y con el lugar de las RNNs frente a los Transformers.

## Secciones

1. **`mapa`:** antes (redes, backprop y regularización; CNN explota localidad en el espacio) / esta clase (orden y memoria en el tiempo) / después (atención y Transformers). `.note.key`: «una RNN es la misma capa aplicada en cada paso, con un estado que viaja; todo lo bueno (parámetros que no crecen con T) y todo lo malo (productos de muchos factores) sale de esa repetición».

2. **`secuencias` · Secuencias como datos.**
   - x₁, …, x_T con T variable; dentro de una secuencia los elementos dependen entre sí (ya no i.i.d.).
   - Tres formas de salida: (x₁…x_T) → y; → (y₁…y_T); → (y₁…y_S). Tabla con ejemplos de la slide y uno de política pública (clasificar un expediente completo; etiquetar cada palabra de una ley; traducir un acta).
   - `.q`: «¿por qué no meto toda la secuencia a una red densa?» (dimensión variable y ningún peso compartido entre posiciones).

3. **`autoregresivos` · Modelos autoregresivos y estacionariedad.**
   - P(x_t | x_{t−1}, …, x₁) y E[x_t | …]; el problema: el número de inputs crece con t.
   - **Opción 1, ventana fija τ** y **Opción 2, variable latente** h_t = g(h_{t−1}, x_t), en `.cmp` (qué gana y qué pierde cada una).
   - Estacionariedad estricta vs débil (E, Var, Cov que solo depende del desfase h; aclara que esa h es un desfase, no el estado oculto). Por qué importa: las ventanas de train y de validación deben tener dinámicas compatibles; **split por tiempo**.
   - **Mini-laboratorio «Quitar la tendencia»:** serie sintética con semilla (tendencia + estacionalidad de periodo 12 + ruido, 120 pasos), split cronológico 60/60. Selector original / diferencia (x_t − x_{t−1}) / diferencia estacional (x_t − x_{t−12}). Readout: media y varianza de cada mitad. Con la serie original las medias difieren mucho; con diferencias se parecen.

4. **`lenguaje` · Modelos de lenguaje.**
   - `.formula` de la regla de la cadena con «deep learning is fun» (la slide) y luego la forma general con Π. Enlaza a 00 `#producto`.
   - Markov de primer orden y de orden k; por qué de izquierda a derecha (generar un token a la vez; muchos pares contexto → siguiente). Mención: bidireccional/masked se ve después.

5. **`texto` · Texto como secuencia: tokens, vocabulario y n-gramas.**
   - Receta de 5 pasos; tipos de token; `<unk>`; la tokenización cambia longitud, vocabulario y perplejidad.
   - Ley de Zipf: nᵢ ∝ 1/i^α y su versión log-log (recta de pendiente −α). Aviso: aquí α no es la tasa de aprendizaje.
   - `.formula` del bigrama P̂(x_t | x_{t−1}) = n(x_{t−1}, x_t)/n(x_{t−1}) con el ejemplo 40/100 = 0.4 de la slide.
   - `.formula` del smoothing add-ε; limitaciones de los n-gramas (contextos casi iguales tratados como distintos).
   - **Laboratorio «Bigramas, ceros y smoothing»:** corpus de 6 frases sobre leyes y reformas (con `<s>` y `</s>`; |V| = 16 tipos que pueden seguir). Tabla de conteos calculada en vivo. Selector de frase de prueba y control ε (0…1). Muestra P̂ de cada bigrama, log-probabilidad, cross-entropy y perplejidad. Botón «modelo uniforme» ⇒ perplejidad = |V| = 16. Valores verificados: «la ley de salud fue aprobada» con ε = 0 ⇒ PPL 1.450; «la reforma fue publicada» con ε = 0 ⇒ PPL ∞ (bigrama «reforma fue» nunca visto); con ε = 0.1 ⇒ 4.928; con ε = 1 ⇒ 8.683.

6. **`perplejidad` · Evaluar un modelo de lenguaje.**
   - `.formula` de la cross-entropy promedio (−(1/n)Σ log P) con un ejemplo de 4 tokens; enlaza a 03.
   - `.formula` de la perplejidad = exp(CE). Ejemplo: probabilidades 0.5, 0.25, 0.5, 0.125 ⇒ CE = 1.213, PPL = 2^1.75 = 3.364. Casos extremos: 1 si siempre acierta con probabilidad 1; |V| para el uniforme (derivación de 3 pasos con `data-revelar`).
   - `.note.fix`: **no es comparable entre tokenizaciones** (por token; caracteres vs palabras hacen distinto número de predicciones sobre vocabularios distintos). Qué comparar: mismo tokenizador, o log-verosimilitud total del mismo texto.
   - Mini-batches: la etiqueta es la misma subsecuencia desplazada un paso (dibujo con `DL.matriz` o tabla).

7. **`rnn` · La RNN simple.**
   - `.formula` de H_t = φ(X_tW_xh + H_{t−1}W_hh + b_h), ejemplo escalar primero. **Aviso:** aquí φ es la no linealidad (normalmente tanh), no los parámetros del curso; y la slide multiplica el vector fila por la matriz (X·W), al revés de Ωh en las clases 2–4.
   - O_t = H_tW_hq + b_q y softmax. Hidden layer vs hidden state (`.cmp`).
   - **Parámetros compartidos:** conteo d·h + h·h + h que no depende de T (ejemplo propio, no el del examen de práctica). Enlaza a 02 `#contar-parametros`.
   - **Laboratorio «RNN desenrollada»:** RNN escalar h_t = tanh(w_x x_t + w_h h_{t−1} + b) con `DL.pasos` sobre 8 pasos; selector de secuencia (pulso en t = 1, constante, alternada); controles w_x, w_h, b. Cada paso muestra la cuenta y la gráfica de h_t. Con pulso y w_h = 0.5 el recuerdo se borra en pocos pasos; con w_h = 1.5 el estado se queda pegado cerca de ±1 (saturación).

8. **`bptt` · Backpropagation a través del tiempo.**
   - La red desenrollada es una red profunda con pesos compartidos ⇒ backprop normal (enlaza a 04 `#backprop-escalar`). L = (1/T)Σℓ(y_t, o_t). **Aviso:** en estas fórmulas o_t es la salida, no la output gate de LSTM.
   - La recursión de ∂h_t/∂w_h de la slide, traducida («efecto directo + efecto a través del estado anterior»).
   - **Derivación** (`data-revelar`): RNN escalar h_t = tanh(a_t), a_t = w_h h_{t−1} + w_x x_t ⇒ ∂h_t/∂h_{t−1} = tanh′(a_t)·w_h ⇒ ∂h_T/∂h_k = Π factores; con factor constante r, r^{T−k}; verificación 0.9¹⁰⁰ = 2.66 × 10⁻⁵ y 1.1¹⁰⁰ = 13 780.6. Enlaza a 04 `#gradientes-que-se-apagan` (es el mismo producto de la clase 4, ahora a lo largo del tiempo).
   - BPTT completo / truncado (τ) / aleatorio en `.cmp` o tabla; qué sacrifica el truncado.
   - **Laboratorio «Producto a través del tiempo»:** gráfica de log₁₀|∂h_T/∂h_k| contra la distancia T − k. Modo «factor constante» (control r de 0.5 a 1.5) y modo «RNN real» (tanh con w_h controlable, entradas con semilla, factores reales tanh′(a_t)·w_h). Control τ: sombrea los pasos que BPTT truncado ignora. Readouts: r^100 y la contribución del paso más lejano.

9. **`clipping` · Gradient clipping.**
   - `.formula` g ← min(1, θ/‖g‖)·g con ejemplo g = (6, 8), θ = 4 ⇒ ‖g‖ = 10, factor 0.4, g = (2.4, 3.2). **Aviso:** este θ es un umbral (hiperparámetro), no los pesos θ de las clases 1–3.
   - Qué logra y qué no (`.note.fix`: no resuelve vanishing: si ‖g‖ < θ no hace nada).
   - **Laboratorio «Recortar sin girar»:** panel 2D con g arrastrable y control θ (flecha original y recortada; readout de norma, factor y ángulo) + panel de normas de gradiente por paso (serie sintética con semilla: tramo con picos explosivos y tramo que se desvanece), en escala log, con y sin recorte. El recorte aplana los picos y no toca el tramo desvanecido.

10. **`lstm` · LSTM.**
    - Qué controla cada gate; cell state vs hidden state.
    - `.formula` de los cuatro gates (forma general, roles); `.formula` de c_t = f_t ⊙ c_{t−1} + i_t ⊙ c̃_t con ejemplo c_{t−1} = 2, f = 0.9, i = 0.1, c̃ = −1 ⇒ c_t = 1.7; `.formula` de h_t = o_t ⊙ tanh(c_t) ⇒ con o = 0.5, h_t = 0.468.
    - **Por qué ayuda al gradiente:** ∂c_t/∂c_{t−1} = f_t por el camino directo (sin W_hh ni tanh′); con f = 0.99 en 100 pasos queda 0.366, contra 0.9¹⁰⁰ de la RNN simple. Aclara que es el camino directo (las gates también dependen de h_{t−1}) y que no «resuelve mágicamente» todo (la slide lo dice).

11. **`gru` · GRU.**
    - Fórmulas de reset, update, candidato y estado; intuición de r y z (la de la slide: z ≈ 1 conserva). **Aviso:** otros textos invierten z; aquí se sigue la slide (igual que PyTorch).
    - Ejemplo: z = 0.8, h_{t−1} = 1, h̃ = −0.5 ⇒ h_t = 0.7.
    - Comparación LSTM / GRU / RNN: bloques de pesos 4 / 3 / 1 ⇒ parámetros 4×, 3×, 1× del conteo de la RNN simple; sin regla universal de cuál gana (Tarea 7 lo pone a prueba).
    - **Laboratorio «Compuertas y memoria»** (para LSTM y GRU, en esta sección o en la anterior): se escribe un valor 1 en t = 1 y luego llegan 59 pasos de candidatos distractores con semilla. Selector LSTM / GRU / RNN simple; controles f, i, o (LSTM), z (GRU) o w_h (RNN). Gráfica de c_t (o h_t) y readout de la fracción del valor original que sobrevive (f^{T−1}, z^{T−1} o el producto real de la RNN).

12. **`bidireccional` · RNNs bidireccionales.**
    - Dos RNNs, adelante y atrás; h_t = [h→; h←] (dimensión 2h). Cuándo sí (toda la secuencia disponible: clasificar una ley completa, etiquetar palabras) y cuándo no (predicción en tiempo real, generación, pronóstico de demanda).
    - `.note.exam`: la Parte C castiga usar el futuro para predecir el futuro.

13. **`hoy` · RNNs hoy y en política pública.**
    - Por qué los Transformers las desplazaron (paralelizar, dependencias largas con atención) y dónde siguen (online, baja latencia, memoria constante, recursos limitados). Mención de RWKV, S4, Mamba (sin estudiarlos).
    - Ejemplos de la slide en política pública. Guía para la Tarea 7: qué predecir antes de correr (sin inventar resultados).

14. **`practica`** y **`glosario`**.

## Práctica (8 a 10, verifica cada número con script)

- **Calcular:** bigrama con n(la) = 50, n(la, ley) = 10 ⇒ 0.2; add-1 con |V| = 1 000 ⇒ 11/1 050 = 0.0105; un bigrama nunca visto ⇒ 1/1 050 = 0.00095. ¿Qué le hizo el smoothing al bigrama frecuente?
- **Calcular:** perplejidad de 4 tokens con probabilidades 0.5, 0.25, 0.5, 0.125 ⇒ CE = 1.213, PPL = 3.364. ¿Y el modelo uniforme con |V| = 50 000?
- **Explicar / trade-off:** dos equipos reportan perplejidad con tokenizadores distintos (palabras vs subpalabras): ¿se puede concluir? ¿Qué compararías? (no copiar la pregunta B2d tal cual).
- **Calcular:** parámetros de una RNN con entrada 50, estado 128, salida sobre vocabulario de 5 000: recurrencia 22 912, salida 645 000, total 667 912; con T = 20 vs T = 500 no cambia. ¿Y la recurrencia de una LSTM y una GRU del mismo tamaño? (91 648 y 68 736).
- **Calcular:** desenrollar h_t = tanh(0.5x_t + 0.8h_{t−1}), h₀ = 0, x = (1, 0, 2) ⇒ h = (0.462, 0.354, 0.857).
- **Predecir:** factor 0.95 por paso durante 50 pasos (0.077) y 1.05 (11.47); qué pasa con τ = 20 (0.95²⁰ = 0.358).
- **Calcular / V-F:** clipping de g = (9, −12, 0) con θ = 3 ⇒ ‖g‖ = 15, factor 0.2, (1.8, −2.4, 0); g = (0.3, 0.4) queda igual. «El clipping resuelve exploding y vanishing»: falso, justifica.
- **Calcular / Mecanismo:** paso LSTM c_{t−1} = 2, f = 0.9, i = 0.1, c̃ = −1, o = 0.5 ⇒ c_t = 1.7, h_t = 0.468. Con f = 0.99, i = 0 durante 100 pasos, c = 2·0.99¹⁰⁰ = 0.732.
- **Calcular / Explicar:** GRU z = 0.8, h_{t−1} = 1, h̃ = −0.5 ⇒ 0.7. ¿Qué z reemplaza el estado? ¿Qué gate de la LSTM es el análogo de z ≈ 1?
- **Diagnosticar / Crítica:** un agente propone una BiLSTM con split aleatorio por semana para pronosticar llamadas de emergencia; y otra BiLSTM para clasificar leyes completas. Cuál es válida y por qué; corrección de la otra (unidireccional + split por tiempo + línea base).

## Glosario

Secuencia, token, tokenización, vocabulario, `<unk>`, modelo autoregresivo, ventana fija, variable latente, estado oculto, estacionariedad estricta, estacionariedad débil, drift, modelo de lenguaje, regla de la cadena, modelo de Markov de orden k, n-grama, ley de Zipf, smoothing, cross-entropy, perplejidad, RNN, desenrollar, parámetros compartidos, BPTT, BPTT truncado, vanishing / exploding gradients, gradient clipping, LSTM, cell state, forget / input / output gate, candidato de memoria, GRU, reset gate, update gate, RNN bidireccional, Transformer, state space model.

## Avisos

- **Choques de notación** (dilos en el texto, cada uno donde aparece): φ = no linealidad (no parámetros); θ = umbral de clipping (no pesos); α en Zipf (no tasa de aprendizaje); o_t = salida en BPTT vs output gate en LSTM; h en la covarianza de la estacionariedad = desfase (no estado oculto); n = longitud de la secuencia en la perplejidad, n de n-grama y n(·) de conteos; ε del smoothing (no el estabilizador de Adam/BN).
- La slide usa la convención fila·matriz (X_tW_xh); en las clases 2–4 se usaba Ωh + β. Es la misma operación con la matriz transpuesta.
- 0.9¹⁰⁰ = 0.0000266 (la slide redondea a 0.00003); 1.1¹⁰⁰ = 13 780.6.
- GRU: la slide usa h_t = z ⊙ h_{t−1} + (1 − z) ⊙ h̃ (z ≈ 1 conserva). Algunos libros usan la convención contraria; respeta la de la slide.
- El examen da un formulario con estas ecuaciones: el énfasis es **qué hace cada pieza y qué pasa si la cambias**, no memorizarla.
- Faltan en `notacion.js` todos los símbolos propios de RNN (T, τ, |V|, H_t, W_xh, W_hh, W_hq, b_h, b_q, O_t, c_t, c̃_t, f_t, i_t, o_t, r_t, z_t, h̃_t, θ de clipping, PPL). Escríbelos sin `data-s`, con su color de rol, y repórtalos.
