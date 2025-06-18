# Sistema de Gestión de Citas Médicas

Aplicación web para la gestión de citas médicas con arquitectura separada de frontend (Angular) y backend (Node.js) con base de datos MySQL.

## Estructura del Proyecto

proyecto/
├── frontend/          # Aplicación Angular
│   ├── src/
│   └── ...
├── backend/           # Servidor Node.js
│   ├── src/
│   └── ...
└── package.json       # Configuración principal

## Requisitos Previos

Node.js (v14 o superior)
Angular CLI
MySQL (v8.0 o superior)

## Configuración Inicial

Clonar el repositorio
Instalar todas las dependencias:
```bash
npm run install-all
```

Configurar la base de datos:
    Asegúrate de que MySQL esté ejecutándose
    Verifica la configuración en backend/.env (si no existe, crea este archivo basado en .env.example)

## Iniciar la Aplicación

Para iniciar tanto el frontend como el backend simultáneamente:

```bash
npm start
```

Esto iniciará:

    Frontend Angular en http://localhost:4200/
    Backend Node.js en http://localhost:3000/

## Iniciar Componentes por Separado

Para ejecutar solo el backend:
```bash
npm run backend
```
Para ejecutar solo el frontend:
```bash
npm run frontend
```

## Desarrollo con Angular
Generar Nuevos Componentes
```bash
cd frontend
ng generate component component-name
```
Para una lista completa de opciones disponibles:
```bash
ng generate --help
```
Compilación
```bash
cd frontend
ng build
```
Los archivos compilados se almacenarán en el directorio frontend/dist/

## API Backend
El backend proporciona los siguientes endpoints:

    GET /api/patients - Obtener todos los pacientes
    POST /api/patients - Registrar nuevo paciente
    GET /api/physicians - Obtener todos los médicos
    POST /api/physicians - Registrar nuevo médico
    GET /api/auth - Autenticación de usuarios

Base de Datos
La aplicación utiliza MySQL con las siguientes tablas principales:

    patients - Información de pacientes
    physicians - Información de médicos

## Pruebas
Pruebas Unitarias (Frontend)
```bash
cd frontend
ng test
```
## Recursos Adicionales
    Angular Documentation
    Node.js Documentation
    Express Documentation
    MySQL Documentation