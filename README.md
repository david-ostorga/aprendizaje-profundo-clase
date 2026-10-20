# Aprendizaje profundo y sus usos en las políticas públicas

**Escuela de Gobierno y Transformación Pública, Tec de Monterrey**
Profesora: Fernanda Sobrino (fersobrinono@tec.mx)

## ¡Bienvenidos!

Este es el repositorio espejo de la clase *Aprendizaje profundo y sus usos en las políticas públicas*. La rama `artefactos` reúne material de apoyo para estudiar: explicaciones interactivas de los temas del primer examen y el entorno necesario para correr los notebooks de la clase.

## Qué hay en esta rama

- **[Explicaciones/](Explicaciones)**: 8 artefactos en HTML para estudiar para el primer examen (matemáticas, repaso de ML, redes neuronales, entrenamiento, regularización y una guía de introducción a PyTorch).
- **`pyproject.toml` y `uv.lock`**: definen el ambiente virtual y las paqueterías necesarias para ejecutar todo lo del repositorio, en especial los notebooks.

## Cómo ver los artefactos

Tienen dos opciones:

1. **Desde el navegador:** descarguen el archivo `.html` que quieran y ábranlo con el navegador de su preferencia.
2. **Desde Visual Studio Code:** abran el archivo con la extensión *Live Server*, que lo despliega automáticamente en su navegador predeterminado.

## Cómo preparar el ambiente

Necesitan tener instalado [`uv`](https://docs.astral.sh/uv/). Después, desde la carpeta del repositorio:

```bash
uv sync
```

Esto crea su propio ambiente virtual e instala las paqueterías necesarias.

## Si quieren hacer sus propias versiones de los notebooks

Por favor trabajen en una **rama propia**, creada a partir de esta, para evitar conflictos entre versiones de los archivos:

```bash
git checkout -b mi-rama
uv sync
```
