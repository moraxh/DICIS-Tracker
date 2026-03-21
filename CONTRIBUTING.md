# Guía de Contribución

¡Hola! Muchas gracias por tu interés en aportar al proyecto. Toda la ayuda es súper bienvenida. Para que tu Pull Request (PR) se revise y apruebe rápidamente, te compartimos los lineamientos principales del proyecto.

## 1. Alcance del Proyecto
DICIS-Tracker está diseñado para ser una herramienta de consulta rápida para estudiantes. 
* **Mantén el enfoque:** Evita proponer funcionalidades que lo conviertan en una herramienta de gestión personal (como paneles de usuario o registro histórico de materias). Por cuestiones de términos legales y enfoque, queremos evitar replicar los sistemas y plataformas oficiales de la universidad.

## 2. Rendimiento y Arquitectura
Dado que gran parte del tráfico proviene de dispositivos móviles, la eficiencia y el uso de batería son críticos.
* **Procesamiento en el Backend:** La lógica de negocio compleja, los filtros sobre listas grandes, y la validación de solapamientos deben procesarse en la API. El frontend debe mantenerse ligero y dedicarse principalmente a renderizar la información. Evita introducir ciclos de alta complejidad algorítmica en el cliente.
* **Optimización en el Cliente:** Minimiza las recargas constantes o el uso de temporizadores (`setInterval`) repetitivos en el frontend para actualizar datos, ya que esto degrada la experiencia en celulares y limita el uso del caché.

## 3. Manejo de Dependencias
Al ser una aplicación enfocada en la rapidez, somos rigurosos con el tamaño del proyecto.
* **Evalúa la necesidad:** Preferimos evitar incluir paquetes o librerías pesadas (como herramientas avanzadas de manejo de estado o virtualización) si la funcionalidad puede resolverse con el stack actual o usando enfoques más livianos. Toda nueva dependencia debe estar fuertemente justificada.

## 4. Diseño y Estilos
* **Coherencia Visual:** Procura mantener la coherencia con el diseño y la paleta de colores actual. Si deseas proponer un cambio general a la interfaz o implementar nuevos temas visuales, por favor abre un *Issue* primero para discutirlo antes de escribir el código.

## 5. Mantenibilidad e Infraestructura
El propósito a largo plazo del proyecto es mantenerlo **100% gratuito** apoyándonos en tiers gratuitos de plataformas como Vercel y GitHub Actions.
* **Eficiencia:** Cualquier contribución que mejore los tiempos de carga, reduzca consultas innecesarias, optimice la base de datos o disminuya tiempos de *build* es sumamente valorada.

## 6. Sugerencias para PRs
* **PRs Atómicos:** Mantén tus PRs enfocados en una sola cosa. Si deseas realizar mejoras de UI/componentes y a la vez modificar lógica profunda de los servicios, es mejor separarlos en PRs distintos. Esto facilita mucho su revisión e integración.

¡Gracias de nuevo por tu tiempo y tus aportes! Estamos emocionados de colaborar contigo.

## 7. Formato de Código (Linting automático)
Para mantener nuestro código limpio y ordenado de forma automática, hemos implementado herramientas de autorresolución de formato tanto para el frontend como para los scripts.

**1. Acción Automática (Pre-commit)**
El proyecto cuenta con un sistema de Git Hooks administrado por **Husky** y **lint-staged**. Esto significa que **cada vez que ejecutes un `git commit`**, el proyecto va a interceptar tus archivos modificados y automáticamente ejecutará:
* `biome check --write` para archivos de Next.
* `ruff check --fix` y `ruff format` para archivos de Python. 

Para que esto funcione correctamente en tu entorno local, asegúrate de correr al menos una vez `pnpm install` desde tu subdirectorio **frontend**.

**2. Validación en la Nube (GitHub Actions)**
Si por alguna razón el hook no se ejecutó, el repositorio tiene configurada una acción de GitHub que revisa la sintaxis y el formato del código cada que abres un Pull Request o haces un Push a la rama principal. ¡Asegúrate de que no haya errores marcados en rojo en tu PR para que podamos aprobarlo fácilmente!
