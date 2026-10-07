# Brief 05 · Regularización (y diagnóstico, cierre del Examen 1)

- **Archivo:** `Explicaciones/05_regularizacion.html` · `nav.serie data-actual="05"`
- **Título:** «Regularización: ganar fuera de muestra, no solo en entrenamiento»
- **Fuente:** `slides/Regularizacion.Rmd` (628 líneas). Léela completa.
- **Temario:** `Examenes/Examen1_Temario.md` §5 **y §6 (Diagnóstico, Parte C del examen)**. Este artefacto cierra el material del Examen 1, así que incluye un simulador de diagnóstico que integra todo.
- **Enlaza a 00:** `#probabilidad` (Normal, prior), `#vectores` (norma), `#funciones` (log) y `#sym-<clave>`. Enlaza a `01_repaso_ml.html#l2` (weight decay ya derivado), `03_entrenamiento1.html#sgd` (ruido de SGD) y `04_entrenamiento2.html#double-descent` (sesgo inductivo).

## Objetivo

Que el estudiante entienda la regularización como **cualquier cosa que mejora el desempeño fuera de muestra**: explícita (λ·g(φ), con su lectura probabilística MAP), implícita (el propio optimizador) y heurísticas (BatchNorm, early stopping, dropout, ensambles, ruido, augmentation, transfer, multi-task, self-supervised). Para cada heurística: qué hace, cuándo ayuda y cuándo no. Y que sepa **diagnosticar** un entrenamiento a partir de curvas y tablas.

## Secciones

1. **`mapa`:** las tres razones de la brecha entre train y test (de la slide). `.note.key`: «regularizar = preferir ciertas soluciones cuando muchas ajustan igual de bien el entrenamiento».

2. **`explicita` · Regularización explícita.**
   - φ̂ = argmin [Σℓᵢ + λg(φ)] con `.formula`; papel de λ.
   - **Laboratorio «Pérdida + penalización»:** pérdida cuadrática en 2 parámetros con contornos elípticos (mínimo lejos del origen, ejes correlacionados) + contornos circulares de ‖φ‖². Control de λ: el óptimo regularizado se mueve del mínimo original hacia el origen y su trayectoria completa se dibuja. Calcula el óptimo cerrado (A + λI)⁻¹b. Selector L2/L1: con L1 los contornos son rombos y el óptimo cae en un eje (esparsidad; Tarea 5 usa L1). Para L1 resuelve numéricamente (descenso por coordenadas con soft-threshold).

3. **`map` · Interpretación probabilística: la prior.**
   - Qué es una prior (sin jerga bayesiana pesada).
   - MAP = verosimilitud × prior.
   - **Derivación** (`data-revelar`): −log de la posterior; prior N(0, σ²_φ) por parámetro ⇒ −log P(φ) = Σ φⱼ²/(2σ²_φ) + constante ⇒ L2 con λ = 1/(2σ²_φ) (en la escala de suma sin 1/n de la slide).
   - **Mini-laboratorio:** campana de la prior con control de σ_φ, enlazado al λ equivalente. Prior estrecha = «estoy muy seguro de que los pesos son chicos» = λ grande.

4. **`l2` · L2 / weight decay en redes.**
   - Por qué NO se regularizan los sesgos: solo desplazan, no aumentan la flexibilidad, y penalizarlos sesga el nivel de las predicciones.
   - Relación con weight decay (enlaza a 01; no vuelvas a derivarla, solo recuérdala en una línea).
   - Por qué puede ayudar (menos varianza, preferencia por soluciones de norma pequeña en redes sobreparametrizadas) y por qué NO garantiza mejor generalización (`.note.fix`).

5. **`implicita` · Regularización implícita.**
   - El optimizador no es neutral.
   - Pérdida modificada de GD: L̃_GD = L + (α/4)‖∇L‖², traducida: «GD se comporta como si además penalizara las zonas empinadas». Lo mismo para SGD, con el término de varianza entre mini-batches: «y además prefiere zonas donde todos los batches están de acuerdo».
   - Cómo influyen α y |B|.
   - **Laboratorio «Mínimo plano contra mínimo afilado»:** pérdida 1D con dos mínimos de profundidad similar, uno estrecho y uno ancho (por ejemplo, suma de dos pozos gaussianos invertidos). Simula 200 corridas desde inicios aleatorios con GD y con SGD (ruido gaussiano en el gradiente, con escala proporcional a α/|B|). Histograma de en qué mínimo termina cada corrida. Controles de α y |B|. Verifica en node que más ruido favorece el mínimo ancho; si no, ajusta la forma y documenta qué usaste.
   - Aclara que es una aproximación útil, no una ley exacta.

6. **`batchnorm` · Batch Normalization.**
   - Las dos fórmulas con `.formula` (normalizar y luego γx̂ + β).
   - **Laboratorio «Calculadora BN»** con `DL.pasos`: mini-batch de 4 valores de una neurona (por ejemplo 2, 4, 6, 12) → μ_B → σ²_B → x̂ → y = γx̂ + β, con controles para γ y β. Luego el modo inferencia con promedios móviles. Un control de tamaño de batch (2…64) que muestra cuánto varía μ_B entre batches distintos de la misma población: con batches chicos las estadísticas son ruidosas.
   - Entrenamiento vs inferencia (examen de práctica A6). Alternativas: LayerNorm y GroupNorm.

7. **`early-stopping` · Early stopping.**
   - Curvas de train y validación. **Laboratorio:** curvas simuladas (train decreciente; validación en U con ruido, `DL.rng`), con controles de paciencia y tolerancia mínima. Marca dónde se detendría y cuál checkpoint se guarda.
   - Hiperparámetros: métrica, paciencia, tolerancia y frecuencia.
   - Parecido con L2 (limita cuánto se alejan los pesos de la inicialización) y diferencia (actúa sobre el tiempo, no sobre la pérdida).

8. **`dropout` · Dropout.**
   - Inverted dropout con `.formula`. Verificación numérica de E[h′] = h: (1 − p)·h/(1 − p) + p·0 = h.
   - **Laboratorio:** red pequeña dibujada en canvas (capa de 8 neuronas con valores h). Cada clic en «nueva máscara» apaga al azar con probabilidad p (control) y reescala las sobrevivientes. El promedio acumulado de h′ converge a h. Modo «inferencia» sin máscara ni reescalado. Modo «MC dropout»: N pasadas → media y dispersión de la salida.
   - Interpretación como ensamble de subredes que comparten pesos. Por qué NO se reescala en inferencia: ya se reescaló en entrenamiento.

9. **`otras` · Ensambles, ruido y augmentation.**
   - Ensambles (promediar reduce varianza; costo).
   - Ruido en inputs, pesos y etiquetas: el de etiquetas suele dañar.
   - **Augmentation:** la transformación debe preservar la etiqueta. **Mini-laboratorio** «¿preserva la etiqueta?»: tarjetas con caso + transformación, como dígito 6 con rotación de 180° (→ 9, no preserva), radiografía con espejo horizontal (depende: el corazón cambia de lado), «el servicio fue bueno» con sinónimos (preserva) y negación (no preserva), imagen satelital con rotación (preserva). Eliges sí/no y ves la explicación (`DL.selector` + texto).

10. **`transfer` · Transfer learning, multi-task y self-supervised.**
    - `.flow` de cada uno. Cuándo ayudan; transferencia negativa.
    - Ejemplo de política pública: un modelo preentrenado en ImageNet adaptado a imágenes satelitales para medir pobreza (Jean et al. 2016, citado en el README del curso).

11. **`catalogo` · Catálogo y receta práctica.**
    - La tabla de categorías de la slide.
    - Régimen de pocos datos: qué priorizar y por qué agregar capacidad sin datos ni sesgo inductivo puede empeorar.

12. **`diagnostico` · Diagnóstico: juntar todo (temario §6).**
    - Las tres familias: sesgo (subajuste), varianza (sobreajuste) y optimización (LR, inicialización, gradientes).
    - **Laboratorio «Simulador de diagnóstico»:** un banco de unos 8 escenarios. Cada uno trae curvas de train/val de pérdida (y de accuracy cuando aplique) generadas con fórmulas + ruido, la norma del gradiente por época y una línea de contexto. Tú eliges el diagnóstico (`DL.selector`) y dos intervenciones de una lista; el simulador da retroalimentación y la predicción de su efecto en train y val. Escenarios:
      1. subajuste;
      2. sobreajuste con mínimo de val en la época 12;
      3. LR demasiado alto (oscila o NaN);
      4. gradientes que desaparecen (red profunda sigmoide, pérdida plana desde el inicio);
      5. **val mejor que train de forma sospechosa** (fuga de información, o dropout activo solo en train: explica las dos posibilidades);
      6. «elegimos con test»;
      7. BatchNorm con batch de 2 (val errática);
      8. sano.
    - Incluye «un agente sugiere duplicar las capas» como pregunta en el escenario 1 (ataca el problema correcto) y en el 2 (lo empeora).
    - NO copies la tabla de la Parte C del examen de práctica; crea escenarios propios.

13. **`practica`** y **`glosario`**.

## Práctica (8 a 10)

- **Derivar:** MAP con prior Laplace ⇒ ¿qué regularización sale? (L1). Escribe los pasos.
- **Explicar:** ¿por qué no se regulariza el sesgo?
- **Calcular:** inverted dropout con p = 0.25 y h = (4, 0, 2, 8), máscara (1, 1, 0, 1) ⇒ h′ = (5.33, 0, 0, 10.67). ¿Qué sale en inferencia?
- **Calcular:** BatchNorm de (1, 3, 5, 7) con γ = 2, β = 1 y ε ≈ 0 (μ = 4, σ² = 5; verifica en node).
- **Predecir:** batch size de 2 con BatchNorm: ¿qué esperas en validación y qué usarías en su lugar?
- **Explicar:** early stopping vs L2: un parecido y una diferencia.
- **Explicar:** ¿qué augmentations usarías para clasificar fotos de baches en calles? ¿Cuáles NO, y por qué?
- **Diagnosticar:** escenario con tabla + curvas (de tu banco): diagnóstico, 2 intervenciones y predicción.
- **Diagnosticar:** «val accuracy 92% y train accuracy 81%»: ¿qué revisarías?
- **Explicar:** ¿por qué agregar dropout a un modelo que subajusta empeora las cosas?

## Glosario

Regularización explícita, implícita, prior, posterior, MAP, L2, L1, weight decay, esparsidad, pérdida modificada, BatchNorm, LayerNorm, early stopping, paciencia, ensamble, dropout, inverted dropout, MC dropout, data augmentation, transfer learning, fine-tuning, multi-task learning, transferencia negativa, self-supervised learning, fuga de información (data leakage).

## Avisos

- La slide de la prior usa P(y | x, φ) sin 1/n; respeta esa escala para que λ = 1/(2σ²_φ) cuadre, y dilo.
- La fórmula de L̃_SGD de la slide tiene dos renglones equivalentes; usa el segundo (el expandido) para traducir.
- Notebook relacionado: `notebooks/Regularizacion.ipynb`. Tarea relacionada: `tareas/Tarea5.ipynb` (weight decay × optimizador, L1 y pruning).
