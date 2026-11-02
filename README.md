# backend1-turnos-reservas

Proyecto backend en Node.js (ESM) para un sistema de turnos y reservas. Incluye la clase `ServiceManager`, que gestiona los servicios disponibles (crear, listar, buscar, actualizar y eliminar) y los guarda en un archivo JSON. También expone esas operaciones a través de una API REST con Express.

## Requisitos

- Node.js 20.11 o superior (se usa `import.meta.dirname`)
- npm

## Instalación

```bash
git clone <url-del-repositorio>
cd backend1-turnos-reservas
npm install
```

Crea el archivo `.env` a partir del ejemplo y completa los valores:

```bash
cp .env.example .env
```

## Variables de entorno

| Variable   | Descripción                    | Ejemplo       |
|------------|--------------------------------|---------------|
| `PORT`     | Puerto donde escucha el server | `8080`        |
| `NODE_ENV` | Entorno de ejecución           | `development` |

`src/config/env.config.js` valida que ambas variables existan al iniciar. Si falta alguna, la aplicación se detiene con un mensaje indicando cuál falta.

## Cómo ejecutar

```bash
npm start      # modo normal
npm run dev    # modo desarrollo (se reinicia al guardar cambios)
```

El servidor queda disponible en `http://localhost:8080`.

## Estructura

```
src/
  config/env.config.js                        # carga y valida las variables de entorno
  managers/ServiceManager.js                  # lógica de gestión de servicios
  middlewares/validateService.middleware.js   # valida campos obligatorios en el POST
  middlewares/routingDetector.middleware.js   # loguea método y URL de cada request
  routes/services.router.js                   # rutas /api/services (express.Router)
  data/services.json                          # "base de datos" en archivo JSON
  app.js                                      # configura Express y monta las rutas
  server.js                                   # levanta el servidor en el puerto del .env
package.json
.env.example
.gitignore
README.md
```

## Recurso `services`

Cada servicio tiene esta forma:

| Campo         | Tipo    | Descripción                                   |
|---------------|---------|-----------------------------------------------|
| `id`          | number  | Identificador único, se genera automáticamente |
| `name`        | string  | Nombre del servicio                           |
| `description` | string  | Descripción del servicio                      |
| `duration`    | number  | Duración en minutos                           |
| `price`       | number  | Precio en pesos chilenos                      |
| `category`    | string  | Categoría (peluqueria, spa, salud, etc.)      |
| `available`   | boolean | Si el servicio está disponible para reservar  |

```json
{
  "id": 1,
  "name": "Corte de cabello",
  "description": "Corte clásico o moderno con lavado incluido",
  "duration": 30,
  "price": 12000,
  "category": "peluqueria",
  "available": true
}
```

## Uso de `ServiceManager`

```js
import ServiceManager from './managers/ServiceManager.js';

const manager = new ServiceManager('./src/data/services.json');
```

### `getServices(filters)`

Devuelve todos los servicios. Opcionalmente recibe filtros por `category` (no distingue mayúsculas) y `available` (`"true"` o `"false"`, como llegan desde la URL).

```js
const services = await manager.getServices();
// [ { id: 1, name: 'Corte de cabello', ... }, ... ]

await manager.getServices({ category: 'salud' });
// [ { id: 3, name: 'Consulta nutricional', category: 'salud', ... } ]

await manager.getServices({ available: 'true' });
// solo los servicios con available: true
```

### `getServiceById(id)`

Devuelve el servicio o `null` si no existe.

```js
await manager.getServiceById(1);   // { id: 1, name: 'Corte de cabello', ... }
await manager.getServiceById(999); // null
```

### `addService(serviceData)`

Agrega un servicio. El `id` se genera automáticamente; si se envía uno, se reemplaza por el generado. La validación de los campos obligatorios (`name`, `description`, `duration`, `price`, `category`, `available`) la hace el middleware `validateService` antes de llegar al método, en la ruta `POST /api/services`.

```js
await manager.addService({
  name: 'Limpieza facial',
  description: 'Limpieza profunda con extracción',
  duration: 60,
  price: 30000,
  category: 'estetica',
  available: true,
});
// { payload: { id: 6, name: 'Limpieza facial', ... }, status: 'success' }
```

### `updateService(id, updatedData)`

Actualiza solo los campos enviados. El `id` no se puede modificar.

```js
await manager.updateService(1, { price: 15000, id: 99 });
// { payload: { id: 1, name: 'Corte de cabello', price: 15000, ... }, status: 'success' }

await manager.updateService(999, { price: 15000 });
// { payload: null, status: 'error', message: 'Servicio no encontrado' }
```

### `deleteService(id)`

Elimina el servicio y lo devuelve, o devuelve `null` si no existe.

```js
await manager.deleteService(5);   // { id: 5, name: 'Clase de yoga personalizada', ... }
await manager.deleteService(999); // null
```

## Endpoints de la API

| Método | Ruta                | Descripción                | Respuestas    |
|--------|---------------------|----------------------------|---------------|
| GET    | `/api/services`     | Lista todos los servicios. Acepta filtros `?category=` y `?available=true\|false` | 200 |
| GET    | `/api/services/:sid`| Obtiene un servicio por id | 200, 404      |
| POST   | `/api/services`     | Crea un servicio           | 201, 400      |
| PUT    | `/api/services/:sid`| Actualiza un servicio      | 200, 404      |
| DELETE | `/api/services/:sid`| Elimina un servicio        | 200, 404      |

### Filtros (query params)

`GET /api/services` lee los filtros desde `req.query`. Se pueden usar por separado o combinados:

```
GET /api/services?category=salud
GET /api/services?available=true
GET /api/services?category=spa&available=true
```

### Ejemplo de creación

El `id` no se envía en el body: lo genera el servidor.

```bash
curl -X POST http://localhost:8080/api/services \
  -H "Content-Type: application/json" \
  -d '{"name":"Limpieza facial","description":"Limpieza profunda","duration":60,"price":30000,"category":"estetica","available":true}'
```
