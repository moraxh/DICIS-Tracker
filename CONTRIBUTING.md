# Guía de Contribución

¡Hola! Muchas gracias por tu interés en aportar a DICIS Tracker. Toda ayuda es bienvenida, especialmente si mantiene la app rápida, útil, confiable y gratuita para estudiantes.

## 0. Agregar tu perfil a los contribuidores

Si realizaste un PR que aportó valor al proyecto, nos encantaría darte crédito.

Edita `frontend/src/data/contributors.json` y agrega tu usuario de GitHub:

```json
[
  "usuario-existente",
  "tu-usuario-de-github"
]
```

Esto levantará automáticamente tu foto de perfil desde GitHub y te agregará al pie de página del proyecto. Puedes incluirlo en el mismo PR o abrir uno pequeño después.

## 1. Alcance del proyecto

DICIS Tracker está diseñado como una herramienta de consulta rápida para estudiantes.

- **Mantén el enfoque:** evita funcionalidades que lo conviertan en una plataforma de gestión académica, registro personal de materias o historial escolar.
- **Respeta el contexto legal:** no queremos replicar ni sustituir sistemas oficiales de la universidad.
- **Cuida el aviso legal:** la app debe seguir comunicando que es una herramienta independiente, informativa y basada en fuentes públicas.

## 2. Plataforma gratis

El objetivo a largo plazo es mantener el proyecto **100% gratuito**, apoyándonos en tiers gratuitos como Vercel y GitHub Actions.

- Evita servicios pagados o dependencias operativas nuevas sin discusión previa.
- Mantén el scraping en intervalos prudentes para no saturar fuentes externas.
- Prefiere datos estáticos/exportados cuando la información no necesita actualizarse en vivo.
- Optimiza el tamaño del build y el tiempo de ejecución.
- Reduce consultas innecesarias, trabajo repetido y lógica pesada en el cliente.

Las contribuciones que mejoren tiempos de carga, reduzcan costos o simplifiquen infraestructura son especialmente valiosas.

## 3. Rendimiento y arquitectura

Gran parte del tráfico viene de dispositivos móviles, así que batería, datos y fluidez importan mucho.

- Procesa filtros complejos, solapamientos y transformaciones grandes antes de llegar al cliente cuando sea posible.
- Mantén el frontend enfocado en renderizar datos ya preparados.
- Evita `setInterval` o recargas constantes si el dato puede resolverse por caché, estado local o cálculo puntual.
- No agregues librerías pesadas si el stack actual puede resolver el caso con claridad.

## 4. Datos y scraper

El scraper existe para transformar información pública en una base local fácil de consultar.

- No aumentes agresivamente la frecuencia de scraping.
- Si agregas una fuente, documenta su origen en `docs/data_sources/`.
- Cuida que los datos generados sigan siendo reproducibles.
- Si cambias `frontend/src/data.db`, asegúrate de regenerar los JSON necesarios con el flujo de build.

## 5. Diseño y experiencia

Mantén la interfaz clara, rápida y coherente con el estilo actual.

- Conserva la experiencia mobile-first.
- Usa componentes existentes antes de crear patrones nuevos.
- Evita cambios visuales globales sin abrir primero un issue o discusión.
- Prioriza escaneo rápido: salones, profesores, horarios y disponibilidad deben encontrarse sin fricción.

## 6. PRs atómicos

Mantén tus PRs enfocados en una sola cosa:

- Un bug fix.
- Una mejora visual acotada.
- Una optimización de rendimiento.
- Una mejora al scraper.
- Una actualización de datos.

Si deseas modificar UI, lógica de datos y scraper al mismo tiempo, considera separarlo en PRs distintos.

## 7. Formato de código

El proyecto usa Biome para el frontend y Ruff para Python.

Desde `frontend/`:

```bash
pnpm lint
pnpm format
```

Para Python, dentro de `scrapper/` con el virtualenv activo:

```bash
ruff check --fix .
ruff format .
```

El proyecto también cuenta con hooks de Husky y `lint-staged`. Para activarlos localmente, ejecuta al menos una vez:

```bash
cd frontend
pnpm install
```

## 8. Validación antes del PR

Antes de abrir un PR, procura ejecutar:

```bash
cd frontend
pnpm build
pnpm lint
```

Si tocaste el scraper:

```bash
cd scrapper
python src/main.py
```

Si agregas variables de entorno nuevas, documenta su propósito en el README y no subas valores reales.

¡Gracias por ayudar a que DICIS Tracker siga siendo una herramienta útil para la comunidad estudiantil!
