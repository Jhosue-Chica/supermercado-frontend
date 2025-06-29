# Supermercado Frontend

Aplicación web para la gestión de un sistema de supermercado desarrollada con React y Bootstrap, diseñada para consumir la API REST del backend.

## Descripción

Este proyecto implementa una interfaz de usuario moderna y responsive para gestionar un sistema de supermercado, incluyendo módulos para administración de productos, ventas, usuarios y estadísticas. La aplicación está conectada a una API RESTful mediante llamadas HTTP seguras con autenticación JWT o API Key.

## Características

- **Autenticación**: Sistema de login dual con soporte para JWT y API Key
- **Dashboard**: Panel principal con estadísticas e información relevante
- **Productos**: Gestión completa de inventario con CRUD de productos y ajustes de stock
- **Ventas**: Creación y seguimiento de ventas con detalles de productos, clientes y pagos
- **Usuarios**: Administración de usuarios y permisos por roles
- **Interfaz Responsiva**: Diseño adaptable a diferentes dispositivos
- **Validación de Formularios**: Validación completa con Formik y Yup
- **Notificaciones**: Sistema de alertas y notificaciones con React-Toastify

## Tecnologías utilizadas

- React.js
- React Router para navegación
- React Bootstrap para componentes de UI
- Axios para llamadas HTTP
- Formik y Yup para validación de formularios
- React-Toastify para notificaciones
- FontAwesome para iconos
- Context API para gestión del estado global

## Requisitos previos

- Node.js (v14 o superior)
- API Backend funcionando (supermercado-api)

## Instalación

1. Clonar el repositorio:
   ```
   git clone <url-del-repositorio>
   cd supermercado-frontend
   ```

2. Instalar dependencias:
   ```
   npm install
   ```

3. Configurar variables de entorno:
   - Crear un archivo `.env` en la raíz del proyecto
   - Definir las variables necesarias:
     ```
     REACT_APP_API_URL=http://localhost:5000/api
     ```

## Ejecución

```
npm start
```

La aplicación se ejecutará en `http://localhost:3000`.

## Estructura del proyecto

```
supermercado-frontend/
├── public/             # Archivos públicos
├── src/                # Código fuente
│   ├── components/     # Componentes reutilizables
│   │   ├── ApiDataDisplay/  # Componente para mostrar datos de API
│   │   ├── Auth/      # Componente de autenticación
│   │   └── Navigation/ # Componentes de navegación
│   ├── context/       # Contextos de React (AuthContext)
│   ├── pages/         # Páginas de la aplicación
│   │   ├── Dashboard/  # Página principal/estadísticas
│   │   ├── Login/      # Página de inicio de sesión
│   │   ├── Products/   # Gestión de productos
│   │   ├── Sales/      # Gestión de ventas
│   │   └── Users/      # Gestión de usuarios
│   ├── services/      # Servicios para llamadas a API
│   ├── App.js         # Componente principal con rutas
│   └── index.js       # Punto de entrada
├── .env               # Variables de entorno
├── package.json       # Dependencias y scripts
└── README.md          # Este archivo
```

## Autenticación

La aplicación soporta dos métodos de autenticación:

1. **JWT Token**: Autenticación basada en usuario/contraseña que devuelve un token JWT.
2. **API Key**: Autenticación directa mediante una clave de API.

Para probar la aplicación, puede usar las siguientes credenciales predeterminadas:

- **Usuario/Contraseña**: admin/admin123 o employee/employee123
- **API Key**: sk_test_supermercado123

## Roles y permisos

La aplicación cuenta con tres niveles de acceso:

- **Admin**: Acceso completo a todas las funcionalidades.
- **Manager**: Puede gestionar productos, ventas y ver estadísticas.
- **Employee**: Solo puede crear ventas y consultar productos.

## Integración con Backend

La aplicación está diseñada para conectarse a la API RESTful proporcionada por el proyecto `supermercado-api`. Asegúrese de que el backend esté en ejecución antes de iniciar la aplicación frontend.

## Estado de desarrollo

Este proyecto se encuentra actualmente en fase de desarrollo y algunas funcionalidades podrían cambiar. Para más información sobre próximos cambios, consulte la sección de issues en el repositorio.

## Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo LICENSE para más detalles.

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
