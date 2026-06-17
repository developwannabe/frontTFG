# frontTFG — Frontend EvalFlood4ITS

Frontend Node.js/Express del sistema EvalFlood4ITS. Sirve una aplicación de página única construida con Tailwind CSS y DaisyUI. Toda la comunicación con el backend se realiza mediante llamadas REST a la API de `backTFG` usando jQuery AJAX.

## Requisitos

- Node.js >= 18
- Una instancia de `backTFG` en ejecución

## Instalación

```bash
npm install
```

## Ejecución

```bash
# Desarrollo — modo watch de Tailwind CSS + nodemon
npm run dev

# Compilar CSS una vez (sin watch)
npm run build:css

# Producción — solo servir ficheros estáticos
npm start
```

El servidor escucha en el puerto `PORT` (por defecto `3001`).

## Flujo de la aplicación

El frontend funciona como una máquina de estados del lado del cliente gestionada por `controlWeb.js`. Toda la navegación reemplaza el contenido de `#centerContent` cargando parciales HTML. La URL del backend se configura en `clienteRest.js`.

### Flujo de evaluación

1. **eval1**: El evaluador inicia o reanuda una sesión de evaluación.
2. **eval2**: Por cada transición se muestra la imagen anotada junto con las estimaciones de GPT y Vertex AI. El evaluador puede ajustar la profundidad de inundación y la severidad de obstáculos mediante controles deslizantes, y solicitar una explicación Grad-CAM mediante el botón "Explicar IA", que abre un modal con la imagen original y el mapa de calor en paralelo.
3. Una vez evaluadas todas las transiciones, el paso de puntuación FIS se ejecuta automáticamente y se pasa a la tabla de revisión.
4. **Tabla de revisión**: cada fila muestra el ID de la transición, un badge con color codificado con `inundación/objetos => transitabilidad` (verde `< 3`, amarillo `3–7`, rojo `>= 7`, siguiendo los umbrales de coste de A\*), y el estado de revisión. El evaluador puede sobreescribir la puntuación de transitabilidad de cada transición antes de finalizar.

### Flujo de rutas

La pantalla de rutas permite seleccionar nodos de origen y destino. El backend se consulta periódicamente hasta que el demonio GALGO resuelve la ruta, y se muestra el mapa HTML junto con la secuencia de nodos y el tiempo estimado de llegada.

### Panel de monitorización

Solo para administradores. Dos pestañas:

- **Métricas del modelo**: recuento de predicciones por clase, confianza media, recuento de peticiones XAI, gráfico de distribución de clases y gráfico de predicciones por hora, y tabla de predicciones recientes.
- **Rendimiento del endpoint**: latencia (media y máxima), recuento de peticiones, errores, uso de CPU y número de réplicas — todos desde Cloud Monitoring — más un visor de logs de TorchServe.

## Convenciones importantes

- `clienteRest.js` centraliza todas las llamadas de red. Cada función recibe el token JWT como primer argumento y un callback como último.
- `controlWeb.js` centraliza toda la lógica de renderizado. Los colores de badge para puntuaciones de transitabilidad usan el helper `fisaBadgeClass(val)`, que mapea `< 3` a `dui_badge-success`, `3–7` a `dui_badge-warning` y `>= 7` a `dui_badge-error`.
- El valor de transitabilidad `0` es una puntuación de revisión válida. Todas las comprobaciones usan `!= null` en lugar de truthiness para evitar tratar `0` como no revisado.
- El mapa de calor Grad-CAM devuelto por el backend tiene una resolución de 224×224 píxeles (tamaño de entrada del modelo). Se muestra como imagen estática junto a la original, no mediante un componente de comparación deslizante.
