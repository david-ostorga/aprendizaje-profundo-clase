# Brief 08 · Atención, Transformers y LLMs

- **Archivo:** `Explicaciones/08_transformers.html` · `nav.serie data-actual="08"`
- **Título:** «Atención y Transformers: cada token decide a quién escuchar»
- **Fuente:** `slides/Transformers.Rmd` (≈ 850 líneas). Léela completa, incluida la parte de LLMs.
- **Temario:** `Examenes/Examen2_Temario.md` **§3 (Atención y Transformers) y §4 (LLMs: de modelo base a asistente)**. Tarea relacionada: `tareas/Tarea8.ipynb`, que pide los «ejercicios rápidos» del final de `notebooks/Transformers.ipynb` (cambiar `d_model` y `num_heads`, top-k / top-p, cambiar el corpus y **quitar la máscara causal**). El temario dice que las ablaciones de ese notebook (quitar la máscara causal, quitar la codificación posicional) son material de examen directo.
- **Enlaza a 00:** `#softmax`, `#producto-punto`, `#matriz-vector`, `#esperanza` (varianza de una suma), `#log-exp` y `#sym-<clave>`. Enlaza a `03_entrenamiento1.html#categorica` (softmax + cross-entropy, que es la cabeza del LM), `04_entrenamiento2.html#gradientes-que-se-apagan` (saturación), `05_regularizacion.html#bn-chico` (LayerNorm) y `05_regularizacion.html#transfer` (preentrenar y adaptar). Los artefactos 06 (CNN) y 07 (RNN) todavía no existen: nómbralos sin enlace (ResNet en 06; encoder-decoder recurrente, perplejidad y BPTT en 07).
- **Fuera de alcance:** los decks de *Agentes* y *Ética* (el temario los excluye). La sección de agentes de esta slide sí entra, pero solo como una opción del árbol de decisión.

## Objetivo

Que el estudiante pueda **calcular a mano una atención pequeña** (scores, escalado, softmax, salida), explicar **por qué se divide entre √d_k**, qué gana multi-head, por qué la self-attention necesita **codificación posicional** y qué hacen las **máscaras** de padding y causal (y qué degenera sin la causal). Que pueda **narrar el bloque Transformer** completo, elegir arquitectura y objetivo de preentrenamiento según la tarea, entender **BPE** y por qué cambia la perplejidad, y razonar sobre la cadena **LM base → SFT → RLHF/DPO → RLVR**, MoE, LoRA, RAG, el árbol prompting / RAG / fine-tuning / agente y la evaluación de LLMs.

## Secciones

1. **`mapa`:** antes (RNN y encoder-decoder, artefacto 07) / esta clase / después (agentes, fuera del examen). `.note.key`: «la atención es un promedio ponderado de values, con pesos que decide la propia query; todo lo demás (multi-head, máscaras, posiciones, el bloque) son variaciones de esa línea».

2. **`encoder-decoder` · El cuello de botella.**
   - Encoder RNN → vector de contexto h_T → decoder. «Estadístico suficiente» de todo el input, de tamaño fijo.
   - Tres problemas de las RNN (secuenciales, gradientes que desaparecen, pérdida de información en secuencias largas).
   - `.flow` del encoder-decoder. Analogía: resumir un expediente de 300 páginas en un tuit antes de redactar el dictamen.

3. **`atencion` · Queries, keys y values.**
   - Analogía de la biblioteca (de la slide). Attention pooling: Attention(q, 𝒟) = Σ α(q, kᵢ) vᵢ con `.formula`.
   - Casos extremos: un peso en 1 (búsqueda exacta) y pesos 1/m (average pooling, examen de práctica A7).
   - α = softmax de a(q, k): las cuatro propiedades de la slide.
   - **Aviso de notación:** en esta slide α son los pesos de atención, NO la tasa de aprendizaje de Entrenamiento (que es `data-s="alpha"`). Escríbelo sin `data-s`.
   - Bahdanau: c<sub>t′</sub> = Σ α(s<sub>t′−1</sub>, h<sub>t</sub>) h<sub>t</sub>; ejemplo «The cat sat on the mat» → «gato». Los seis pasos del mecanismo.
   - **Laboratorio «Atención a mano»:** biblioteca con 3 libros: k₁ = (2, 0) (gatos), k₂ = (0, 2) (leyes), k₃ = (1, 1) (de los dos); v₁ = (4, 0), v₂ = (0, 4), v₃ = (2, 2). Query por defecto q = (1, 0.5). `DL.pasos`: productos punto → dividir entre √2 → exponenciales → normalizar → suma ponderada. Controles para q₁, q₂, un selector «dividir entre √d / no dividir» y un botón «permutar los pares (k, v)» que muestra que la salida no cambia. Valores por defecto verificados: scores (2, 1, 1.5), escalados (1.414, 0.707, 1.061), α = (0.456, 0.225, 0.320), salida (2.462, 1.538).

4. **`escalado` · Producto punto escalado y atención aditiva.**
   - a(q, k) = qᵀk/√d con `.formula`. Por qué √d: si las entradas de q y k son independientes con media 0 y varianza 1, Var(qᵀk) = d (suma de d términos de varianza 1; enlaza a 00 `#esperanza`). Dividir entre √d deja la desviación en 1.
   - Qué se rompe sin escalar: softmax saturado → casi one-hot → gradiente ≈ 0 (enlaza a 04 `#gradientes-que-se-apagan`). Fórmula del gradiente del softmax ∂αᵢ/∂aᵢ = αᵢ(1 − αᵢ) en un `<details>` «Para profundizar».
   - **Laboratorio «¿Por qué √d_k?»:** selector d ∈ {2, 8, 32, 128, 512}; 6 keys y una query con entradas N(0, 1) (`DL.rng`), barras de α sin escalar y escaladas; readout con la desviación de los scores, el peso máximo promedio (300 sorteos, semilla 7) y el «tamaño del gradiente» max αᵢ(1 − αᵢ). Verifica en node que sin escalar el peso máximo promedio sube hacia 1 al crecer d y escalado se queda estable.
   - Atención aditiva w<sub>v</sub>ᵀ tanh(W<sub>q</sub>q + W<sub>k</sub>k) con `.formula`; ventajas (de la slide) y cuándo conviene (q y k de distinta dimensión).

5. **`multi-head` · Multi-head attention.**
   - Definición hᵢ = f(Wᵢ<sup>(q)</sup>q, Wᵢ<sup>(k)</sup>k, Wᵢ<sup>(v)</sup>v) y [h₁, …, h_h]W_o con `.formula`. **Aviso:** aquí h es una cabeza (y también el número de cabezas), no la unidad oculta.
   - Aritmética: d_h = d_model / h; con d_model = 512 y h = 8, d_h = 64; los parámetros de W<sup>Q</sup>, W<sup>K</sup>, W<sup>V</sup>, W<sup>O</sup> son 4·512² = 1 048 576 sin sesgos, los mismos que con una sola cabeza: multi-head no encarece, reparte.
   - Tabla self-attention vs multi-head de la slide.
   - **Laboratorio «Dos cabezas, dos preguntas»:** «el gato come pescado» con embeddings de 4 dimensiones (2 de tipo de palabra, 2 de posición). Cabeza 1 rota la posición para mirar al token anterior; cabeza 2 hace que el verbo busque sustantivos. Mapa de atención por cabeza (canvas) y botón «apagar cabeza» con el cambio en la salida de cada token: así se diseña el experimento para medir la importancia de una cabeza (temario §3).

6. **`posicional` · Self-attention y codificación posicional.**
   - Self-attention (input → input) vs atención encoder-decoder (input → output).
   - Invariancia al orden: «el gato come pescado» vs «pescado come el gato». Precisión: cada token recibe la misma salida sin importar su posición (la salida se permuta igual que la entrada).
   - **Laboratorio «¿Importa el orden?»:** atención con W = I sobre las dos frases; sin PE la salida de «gato» es idéntica en ambas; con PE ya no. Readout de la diferencia.
   - PE sinusoidal con `.formula`: ejemplo d = 4, pos = 1 ⇒ (0.841, 0.540, 0.010, 1.000).
   - **Laboratorio «Las ondas de la posición»:** mapa de calor PE(pos, j) para 50 posiciones y d ∈ {16, 32, 64}; slider de posición y gráfica de la similitud PE(p)·PE(p′)/(d/2) contra p′ (pico en p, vecinos parecidos).
   - Tabla sinusoidal vs aprendida (examen de práctica A8).

7. **`mascaras` · Máscaras de atención.**
   - A = softmax(S + M), M<sub>ij</sub> ∈ {0, −∞} con `.formula`; e<sup>−∞</sup> = 0 y el softmax renormaliza sobre lo permitido.
   - Padding mask (columnas de `[PAD]`) y causal mask (triángulo superior). La máscara no cambia parámetros.
   - **Laboratorio «Máscaras»:** «el gato duerme [PAD] [PAD]», scores fijos 5×5, selector sin máscara / padding / causal / ambas. Muestra M, el mapa A con números y que cada fila suma 1.
   - **Ablación (Tarea 8, ejercicio 5):** entrenar un decoder sin máscara causal: la pérdida de entrenamiento se desploma porque el token t ve su respuesta x<sub>t+1</sub>, pero en generación el futuro no existe y el modelo degenera. `.note.exam`.
   - `.note.fix`: si una fila quedara toda en −∞, el softmax da 0/0 (NaN); por eso la fila de un token siempre se ve a sí mismo en la causal.

8. **`bloque` · El bloque Transformer.**
   - Encoder: MHSA → residual + LayerNorm → FFN por posición → residual + LayerNorm, ×N (N = 6 en el original). Decoder: masked MHSA, cross-attention (Q del decoder, K y V del encoder), FFN.
   - Residual x + Sublayer(x): la misma idea que ResNet h<sub>k+1</sub> = h<sub>k</sub> + F(h<sub>k</sub>) (artefacto 06). LayerNorm: enlaza a 05 `#bn-chico`. Aviso: la slide pone LayerNorm después (post-LN); el notebook usa pre-LN. Las dos existen.
   - **Laboratorio «Sigue la forma del tensor»** (pasos declarativos): T = 6 tokens, d_model = 512, h = 8, d_ff = 2048, |V| = 32 000. Forma en cada paso, hasta la capa lineal + softmax (enlaza a 03 `#categorica`).
   - Flujo completo en 4 pasos (de la slide). Por qué es paralelizable y la RNN no.

9. **`nlp` · Transformers para NLP: tokens, objetivos y cabezas.**
   - Pipeline: texto → tokens → IDs → embeddings (token + posición [+ segmento]) → Transformer → cabeza → pérdida.
   - Tokenización: palabras (OOV, vocabulario enorme) vs caracteres (secuencias largas) vs subpalabras.
   - **Laboratorio «BPE paso a paso»:** corpus {ley: 8, leyes: 4, votar: 5, votaron: 3, votó: 2, vota: 4} con marcador de fin de palabra «_». Cada paso cuenta pares adyacentes ponderados por frecuencia y fusiona el más frecuente (en empate gana el que aparece primero). Muestra pares, vocabulario, tokens del corpus (140 → 47 en 10 fusiones; vocabulario 12 → 22) y cómo se parten palabras nuevas («votaremos» → votar·e·m·o·s·_, «rey» → r·e·y·_: nunca hay `<unk>`).
   - Perplejidad y tokenización: la perplejidad es por token, así que no se compara entre tokenizadores; usa log-verosimilitud total o bits por carácter. Ejemplo numérico verificado (ejercicio 8).
   - Objetivos de preentrenamiento (MLM, causal LM, denoising) y tabla arquitectura → tarea → dónde va la cabeza (`[CLS]` → lineal; por token; start/end; LM). Fine-tuning: cabezas, congelar, LR por capa, early stopping; adapters/LoRA/prompt tuning.

10. **`llm` · LLMs: escala y dónde se gasta el cómputo.**
    - GPT-3 (cifras de la slide) y el «Ojo (2026)». Las tres vías de cómputo; reasoning budgets.
    - MoE: router + top-k expertos; parámetros totales vs activos.
    - Multimodales (ViT, CLIP) en una línea cada uno. Zero-shot, few-shot, chain-of-thought.

11. **`asistente` · De LM base a asistente.**
    - El problema del modelo base. SFT (mismo objetivo, otros datos). RLHF (comparaciones → modelo de recompensa → RL). DPO (sin modelo de recompensa). RLVR (verificador mecánico) y modelos de razonamiento.
    - `.flow` de las etapas con datos y señal de cada una.
    - **Laboratorio «Una pregunta, cuatro modelos»:** selector base / +SFT / +RLHF o DPO / +RLVR. Para cada etapa: qué datos usa, qué señal optimiza y una respuesta **ilustrativa** (rotulada como tal) a la misma instrucción. Para RLVR, un problema verificable (1 240 solicitudes en 8 semanas → 155 por semana).
    - `.note.fix`: «alineación como técnica» no resuelve «¿preferencias de quién?».

12. **`adaptar` · ¿Prompt, RAG, fine-tuning o agente?**
    - LoRA ΔW = AB con `.formula` (ejemplo 4096 × 4096, r = 8 ⇒ 65 536 parámetros, 0.39 %). QLoRA en una línea.
    - RAG (qué problema resuelve; por qué domina en gobierno). Agentes (ReAct y el aviso de 2026).
    - **Laboratorio «Calculadora de costos»:** LoRA (d, r) y MoE (expertos, top-k, tamaño por experto, compartidos) con parámetros totales vs activos.
    - Tabla de decisión de la slide + **Laboratorio «Árbol de decisión»:** 6 casos de dependencias públicas; eliges opción y recibes retroalimentación.

13. **`evaluacion` · Evaluación de LLMs.**
    - BLEU, ROUGE, perplejidad y sus límites. Ejemplo calculado: «la capital francesa es parís» vs «parís es la capital de francia»: 4 de 5 unigramas coinciden pero solo 1 de 4 bigramas.
    - fluidez ≠ veracidad ≠ utilidad. Benchmarks (contaminación, saturación, teaching to the test), LLM-as-judge y sus sesgos, alucinación, calibración (ECE de la Tarea 5), red-teaming.
    - Los cinco mínimos de una evaluación para despliegue público. Casos de política pública de la slide (Chalkidis 2019; Gilardi et al. 2023; el LLM como instrumento de medición).

14. **`practica`** y **`glosario`**.

## Práctica (10)

1. **Calcular:** q = (1, 2); k₁ = (1, 0), k₂ = (0, 1), k₃ = (1, 1); v₁ = (2, 0), v₂ = (0, 2), v₃ = (1, 1); d = 2. Scores (1, 2, 3)/√2 = (0.707, 1.414, 2.121); α = (0.140, 0.284, 0.576); salida (0.856, 1.144). ¿Qué cambia si permutas los pares? Nada.
2. **Predecir:** d_k = 64, entradas N(0, 1): desviación de qᵀk ≈ 8; scores (8, 0, −8) sin escalar ⇒ α ≈ (0.9997, 0.0003, 0.0000); escalados (1, 0, −1) ⇒ (0.665, 0.245, 0.090). Qué le pasa al gradiente.
3. **Calcular:** S = [[2, 1, 0], [1, 3, 1], [0, 2, 2]] con máscara causal ⇒ filas (1, 0, 0), (0.119, 0.881, 0), (0.063, 0.468, 0.468). Si el token 3 es `[PAD]` (además de causal): la fila 3 pasa a (0.119, 0.881, 0).
4. **Predecir (ablación):** decoder sin máscara causal: pérdida de entrenamiento y generación.
5. **Calcular + explicar:** PE para pos = 2, d = 4 ⇒ (0.909, −0.416, 0.020, 1.000). ¿Por qué sin PE «el gato come pescado» y «pescado come el gato» dan la misma salida para «gato»?
6. **Calcular:** d_model = 512, h = 8 ⇒ d_h = 64; parámetros de las cuatro matrices (1 048 576); comparar con una sola cabeza.
7. **Calcular:** BPE sobre {casa: 5, casas: 3, cosa: 2} con «_»: fusión 1 = «as» (11), fusión 2 = «cas» (8); tokens del corpus 53 → 42 → 34. ¿Cómo se parte «cosas»? (c·o·s·as·_).
8. **Diagnosticar:** el mismo texto de 12 caracteres; modelo A (subpalabras, 3 tokens con p = 0.2, 0.1, 0.5) perplejidad 4.64; modelo B (caracteres, 12 tokens con p = 0.6) perplejidad 1.67. Log-verosimilitud total: A −4.605, B −6.130 nats; bits por carácter: A 0.554, B 0.737. A es mejor.
9. **Calcular:** LoRA 4096 × 4096 con r = 8 (65 536, 0.39 %). MoE con 2 B compartidos y 16 expertos de 3 B, top-2: 50 B totales, 8 B activos; comparado con un denso de 20 B.
10. **Explicar / diseñar:** SFT vs RLHF vs DPO vs RLVR en una tabla de datos y señal, y elegir prompting / RAG / fine-tuning / agente para un caso de una dependencia.

## Glosario

Encoder-decoder, vector de contexto, atención, query, key, value, attention pooling, pesos de atención, producto punto escalado, atención aditiva, self-attention, cross-attention, multi-head attention, cabeza, codificación posicional, máscara de padding, máscara causal, autoregresivo, conexión residual, LayerNorm, feed-forward por posición, token, tokenización por subpalabras, BPE, OOV, MLM, LM causal, denoising seq2seq, fine-tuning, LoRA, MoE, test-time compute, SFT, RLHF, modelo de recompensa, DPO, RLVR, RAG, agente, perplejidad, BLEU, ROUGE, contaminación, LLM-as-judge, alucinación, calibración, red-teaming.

## Avisos

- **Símbolos que no existen en `notacion.js`:** q, k, v, Q, K, V, d (d_k), W<sup>Q</sup>/W<sup>K</sup>/W<sup>V</sup>/W<sup>O</sup>, α(q, k) de atención, a(q, k), S, A, M, PE, pos, d_model, h (cabezas), d_ff, ΔW = AB, r. Escríbelos con color de rol y sin `data-s`, y repórtalos.
- **Choques de notación:** α (pesos de atención vs tasa de aprendizaje), h (cabeza / número de cabezas vs unidad oculta; en Bahdanau h<sub>t</sub> sí es el estado oculto), A (matriz de atención vs matriz A de LoRA), d (dimensión de q y k; la slide escribe d y d_k indistintamente), K (matriz de keys vs número de clases/capas).
- La slide dice «self-attention es invariante al orden»; precisa que cada token recibe la misma salida (equivariancia por permutación) sin corregir la slide.
- La slide pone LayerNorm «después de cada subcapa» (post-LN); el notebook usa pre-LN. Menciona las dos.
- La slide escribe «Attention(q, D)» con D = base de datos; aquí 𝒟 no es el conjunto de entrenamiento.
- No copies el ejercicio B3 del examen de práctica; usa números propios.
- La parte de 2026 (MoE dominante, RLVR, reasoning budgets) es de la slide; no agregues modelos ni cifras que no estén ahí.
