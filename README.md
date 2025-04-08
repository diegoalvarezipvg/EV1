# Aplicación de Recordatorios con Autenticación

Esta aplicación es un sistema de gestión de recordatorios con autenticación de usuarios, desarrollado con Express.js y Node.js.

## Características

- Autenticación de usuarios con tokens
- Gestión completa de recordatorios (crear, leer, actualizar, eliminar)
- Interfaz de usuario intuitiva
- Almacenamiento en memoria
- Ordenamiento de recordatorios por importancia y fecha

## Requisitos Previos

- Node.js (versión 14 o superior)
- npm (incluido con Node.js)

## Instalación

1. Clona este repositorio:
   ```
   git clone <URL_DEL_REPOSITORIO>
   cd <NOMBRE_DEL_DIRECTORIO>
   ```

2. Instala las dependencias:
   ```
   npm install
   ```

3. Inicia el servidor:
   ```
   npm start
   ```

4. Abre tu navegador y visita:
   ```
   http://localhost:3300
   ```

## Estructura del Proyecto

```
/
├── index.js           # Servidor Express y lógica de la API
├── package.json       # Dependencias y scripts
├── LICENSE            # Licencia MIT
├── public/            # Archivos estáticos
│   ├── index.html     # Página principal
│   ├── app.js         # Lógica del cliente
│   └── styles.css     # Estilos CSS
└── README.md          # Este archivo
```

## API Endpoints

### Autenticación

- **POST /api/auth/login**
  - Autentica a un usuario y devuelve un token
  - Cuerpo: `{ "username": "string", "password": "string" }`
  - Respuesta: `{ "username": "string", "name": "string", "token": "string" }`

### Recordatorios

- **GET /api/reminders**
  - Obtiene todos los recordatorios ordenados por importancia y fecha
  - Requiere token de autenticación en el encabezado `X-Authorization`
  - Respuesta: Array de recordatorios

- **POST /api/reminders**
  - Crea un nuevo recordatorio
  - Requiere token de autenticación en el encabezado `X-Authorization`
  - Cuerpo: `{ "content": "string", "important": boolean }`
  - Respuesta: Recordatorio creado

- **PATCH /api/reminders/:id**
  - Actualiza un recordatorio existente
  - Requiere token de autenticación en el encabezado `X-Authorization`
  - Cuerpo: `{ "content": "string", "important": boolean }`
  - Respuesta: Recordatorio actualizado

- **DELETE /api/reminders/:id**
  - Elimina un recordatorio
  - Requiere token de autenticación en el encabezado `X-Authorization`
  - Respuesta: Código 204 (sin contenido)

## Detalles Técnicos

### Autenticación

- Los tokens se generan usando `randomBytes(48).toString('hex')` de `node:crypto`
- Los tokens se almacenan en memoria como propiedad del objeto usuario
- Todas las rutas (excepto login) requieren autenticación mediante el encabezado `X-Authorization`

### Almacenamiento de Contraseñas

- Las contraseñas se almacenan usando `scrypt` de `node:crypto`
- El formato almacenado es `salt:key` donde:
  - `salt` es un string hexadecimal de 16 bytes generado con `randomBytes`
  - `key` es un string hexadecimal derivado de `scrypt` con `keylen` de 64

### Validación de Datos

- **Content**: Debe ser un string no vacío con máximo 120 caracteres
- **Important**: Debe ser un valor booleano

## Usuario por Defecto

Para probar la aplicación, puedes usar el siguiente usuario:

- **Usuario**: admin
- **Contraseña**: certamen123

## Ejemplos de Uso con cURL

```bash
# Login
curl -X POST http://localhost:3300/api/auth/login -H "Content-Type: application/json" -d "{\"username\": \"admin\", \"password\": \"certamen123\"}"

# Obtener recordatorios
curl -X GET http://localhost:3300/api/reminders -H "x-authorization: TU_TOKEN"

# Crear recordatorio
curl -X POST http://localhost:3300/api/reminders -H "Content-Type: application/json" -H "x-authorization: TU_TOKEN" -d "{\"content\": \"Recordatorio de prueba\", \"important\": true}"

# Actualizar recordatorio
curl -X PATCH http://localhost:3300/api/reminders/ID_DEL_RECORDATORIO -H "Content-Type: application/json" -H "x-authorization: TU_TOKEN" -d "{\"content\": \"Recordatorio actualizado\", \"important\": false}"

# Eliminar recordatorio
curl -X DELETE http://localhost:3300/api/reminders/ID_DEL_RECORDATORIO -H "x-authorization: TU_TOKEN"
```

## Tecnologías Utilizadas

- **Backend**: Express.js, Node.js
- **Frontend**: HTML, CSS, JavaScript (Vanilla)
- **Autenticación**: Tokens personalizados con node:crypto
- **Almacenamiento**: Memoria (arrays en JavaScript)

## Notas de Desarrollo

- La aplicación está diseñada para ser ejecutada en un entorno de desarrollo
- El estado se mantiene en memoria, por lo que se reiniciará al reiniciar el servidor
- Para un entorno de producción, se recomienda implementar una base de datos y medidas de seguridad adicionales

## Autor

**Diego Alvarez Cisternas** - [GitHub](https://github.com/diegoalvarezipvg/EV1)

## Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.
