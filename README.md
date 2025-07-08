# Sistema de Gestión de Citas Médicas

Aplicación web para la gestión de citas médicas con arquitectura separada de frontend (Angular) y backend (Node.js) con base de datos MySQL.

## Estructura del Proyecto

proyecto/
├── frontend/ # Aplicación Angular
│ ├── src/
│ └── ...
├── backend/ # Servidor Node.js
│ ├── src/
│ └── ...
└── package.json # Configuración principal

## Requisitos Previos

- **Node.js** (v14 o superior)
- **Angular CLI** (v15 o superior)
- **MySQL** (v8.0 o superior)
- **NPM** o **Yarn**

## Configuración Inicial

Clonar el repositorio
Instalar todas las dependencias:

```bash
npm run install-all
```

## Configurar la base de datos:

     Crear la base de datos
        
        CREATE DATABASE gestion_citas;
        USE gestion_citas;
        
        Tabla de Pacientes:
        CREATE TABLE patients (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            paternalLastName VARCHAR(100) NOT NULL,
            maternalLastName VARCHAR(100) NOT NULL,
            email VARCHAR(150) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            rut VARCHAR(12) UNIQUE NOT NULL,
            birthDate DATE NOT NULL,
            phone VARCHAR(20),
            address TEXT,
            gender ENUM('M', 'F', 'Otro') NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        );

        Tabla de Médicos:
        CREATE TABLE physicians (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            paternalLastName VARCHAR(100) NOT NULL,
            maternalLastName VARCHAR(100) NOT NULL,
            email VARCHAR(150) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            specialty ENUM(
                'Cardiología', 'Dermatología', 'Endocrinología', 'Gastroenterología',
                'Ginecología', 'Neurología', 'Oftalmología', 'Ortopedia', 'Pediatría',
                'Psiquiatría', 'Radiología', 'Urología', 'Medicina General',
                'Traumatología', 'Oncología', 'Otorrinolaringología'
            ) NOT NULL,
            license_number VARCHAR(50) UNIQUE,
            phone VARCHAR(20),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        );
        Tabla de Asistentes:
        CREATE TABLE assistants (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            paternalLastName VARCHAR(100) NOT NULL,
            maternalLastName VARCHAR(100) NOT NULL,
            email VARCHAR(150) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            phone VARCHAR(20),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        );

        Tabla de Administradores:
        CREATE TABLE administrators (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            paternalLastName VARCHAR(100) NOT NULL,
            maternalLastName VARCHAR(100) NOT NULL,
            email VARCHAR(150) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            role ENUM('super_admin', 'admin') DEFAULT 'admin',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        );

        Tabla de Citas:
        CREATE TABLE appointments (
            id INT AUTO_INCREMENT PRIMARY KEY,
            patient_id INT NOT NULL,
            physician_id INT NOT NULL,
            date DATE NOT NULL,
            time TIME NOT NULL,
            reason TEXT,
            status ENUM('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show') DEFAULT 'scheduled',
            priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
            notes TEXT,
            medical_notes TEXT,
            preparation_notes TEXT,
            administrative_notes TEXT,
            duration INT DEFAULT 30,
            location VARCHAR(100) DEFAULT 'Consulta externa',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

            -- Campos de cancelación
            cancellation_reason VARCHAR(255),
            cancellation_details TEXT,
            cancelled_by VARCHAR(100),
            cancelled_at TIMESTAMP NULL,

            -- Claves foráneas
            FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
            FOREIGN KEY (physician_id) REFERENCES physicians(id) ON DELETE CASCADE,

            -- Índices para optimización
            INDEX idx_patient_date (patient_id, date),
            INDEX idx_physician_date (physician_id, date),
            INDEX idx_date_time (date, time),
            INDEX idx_status (status),
            INDEX idx_priority (priority)
        );

        Tabla de reportes:
            CREATE TABLE report_history (
            id INT AUTO_INCREMENT PRIMARY KEY,
            report_type ENUM('appointments', 'physicians', 'patients', 'general') NOT NULL,
            file_name VARCHAR(255) NOT NULL,
            file_path TEXT NOT NULL,
            generated_by VARCHAR(100) NOT NULL,
            report_summary JSON,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            
            INDEX idx_report_type (report_type),
            INDEX idx_created_at (created_at)
        );
    Insertar datos de prueba
        Administrador por defecto:
            INSERT INTO administrators (name, paternalLastName, maternalLastName, email, password, role)
            VALUES ('Admin', 'Sistema', 'Principal', 'admin@mediconnect.com', 'admin123', 'super_admin');
        Médicos de ejemplo:
            INSERT INTO physicians (name, paternalLastName, maternalLastName, email, password, specialty, license_number, phone) VALUES
            ('María', 'González', 'López', 'maria.gonzalez@mediconnect.com', 'medico123', 'Cardiología', 'MC001', '+56912345678'),
            ('Carlos', 'Rodríguez', 'Pérez', 'carlos.rodriguez@mediconnect.com', 'medico123', 'Dermatología', 'MC002', '+56912345679'),
            ('Ana', 'Martínez', 'Silva', 'ana.martinez@mediconnect.com', 'medico123', 'Pediatría', 'MC003', '+56912345680'),
            ('Juan', 'López', 'García', 'juan.lopez@mediconnect.com', 'medico123', 'Medicina General', 'MC004', '+56912345681'),
            ('Patricia', 'Hernández', 'Morales', 'patricia.hernandez@mediconnect.com', 'medico123', 'Ginecología', 'MC005', '+56912345682');

        Pacientes de ejemplo:
            INSERT INTO patients (name, paternalLastName, maternalLastName, email, password, rut, birthDate, phone, address, gender) VALUES
            ('Pedro', 'Silva', 'Contreras', 'pedro.silva@email.com', 'paciente123', '12345678-9', '1990-05-15', '+56912345683', 'Av. Principal 123', 'M'),
            ('Laura', 'Morales', 'Vega', 'laura.morales@email.com', 'paciente123', '87654321-0', '1985-08-22', '+56912345684', 'Calle Secundaria 456', 'F'),
            ('Roberto', 'Jiménez', 'Castro', 'roberto.jimenez@email.com', 'paciente123', '11223344-5', '1975-12-03', '+56912345685', 'Pasaje Los Álamos 789', 'M'),
            ('Carmen', 'Vargas', 'Rojas', 'carmen.vargas@email.com', 'paciente123', '55667788-1', '1992-03-18', '+56912345686', 'Av. Las Flores 321', 'F');

        Asistente de ejemplo:
            INSERT INTO assistants (name, paternalLastName, maternalLastName, email, password, phone) VALUES
            ('Sofía', 'Mendoza', 'Torres', 'sofia.mendoza@mediconnect.com', 'asistente123', '+56912345687'),
            ('Diego', 'Ramírez', 'Soto', 'diego.ramirez@mediconnect.com', 'asistente123', '+56912345688');


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

# 👥 Roles de Usuario y Credenciales

## 🔐 Credenciales de Prueba

### 👑 Administrador

- **Email:** `admin@mediconnect.com`
- **Password:** `admin123`

### 👨‍⚕️ Médicos

- **Email:** `maria.gonzalez@mediconnect.com` _(Cardiología)_
- **Email:** `carlos.rodriguez@mediconnect.com` _(Dermatología)_
- **Email:** `ana.martinez@mediconnect.com` _(Pediatría)_
- **Password:** `medico123`

### 🧑‍🤝‍🧑 Pacientes

- **Email:** `pedro.silva@email.com`
- **Email:** `laura.morales@email.com`
- **Password:** `paciente123`

### 🏥 Asistentes

- **Email:** `sofia.mendoza@mediconnect.com`
- **Password:** `asistente123`

---

# 🎭 Funcionalidades por Rol

## 👨‍⚕️ Médicos

- ✅ Gestionar sus citas programadas
- ✅ Ver calendario personal
- ✅ Agregar notas médicas
- ✅ Confirmar/completar consultas
- ✅ Manejar cancelaciones
- ✅ Actualizar perfil profesional

## 🧑‍🤝‍🧑 Pacientes

- ✅ Agendar citas con médicos
- ✅ Ver historial de citas
- ✅ Cancelar/reagendar citas
- ✅ Actualizar información personal
- ✅ Ver especialidades disponibles

## 🏥 Asistentes

- ✅ Gestionar citas de todos los pacientes
- ✅ Ver calendario completo
- ✅ Agendar citas en nombre de pacientes
- ✅ Manejar confirmaciones y cancelaciones
- ✅ Agregar notas administrativas

## 👑 Administradores

- ✅ Gestión completa de usuarios
- ✅ Estadísticas del sistema
- ✅ Administrar médicos y especialidades
- ✅ Control total de citas
- ✅ Configuración del sistema

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

# 🌐 API Backend

## 📡 Endpoints principales

### 🔐 Autenticación

- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario

---

### 🧑‍🤝‍🧑 Pacientes

- `GET /api/patients` - Obtener todos los pacientes
- `POST /api/patients` - Registrar nuevo paciente
- `PUT /api/patients/:id` - Actualizar paciente
- `DELETE /api/patients/:id` - Eliminar paciente

---

### 👨‍⚕️ Médicos

- `GET /api/physicians` - Obtener todos los médicos
- `POST /api/physicians` - Registrar nuevo médico
- `GET /api/physicians/specialty/:specialty` - Médicos por especialidad
- `PUT /api/physicians/:id` - Actualizar médico

---

### 📅 Citas

- `GET /api/appointments` - Obtener todas las citas
- `POST /api/appointments` - Crear nueva cita
- `PUT /api/appointments/:id` - Actualizar cita
- `PUT /api/appointments/:id/status` - Cambiar estado de cita
- `PUT /api/appointments/:id/notes` - Agregar notas
- `DELETE /api/appointments/:id` - Eliminar cita

---

### 🏥 Asistentes

- `GET /api/assistants` - Obtener todos los asistentes
- `POST /api/assistants` - Registrar nuevo asistente

---

### 👑 Administradores

- `GET /api/administrators` - Obtener todos los administradores
- `POST /api/administrators` - Registrar nuevo administrador

---

### 🤖 Chatbot IA

- `POST /api/chat` - Interactuar con el chatbot (Gemini AI)

## Pruebas

Pruebas Unitarias (Frontend)

```bash
cd frontend
ng test
```

# 📚 Recursos Adicionales

- [Angular Documentation](https://angular.io/docs)
- [Node.js Documentation](https://nodejs.org/en/docs)
- [Express Documentation](https://expressjs.com/en/4x/api.html)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [Gemini AI Documentation](https://deepmind.google/technologies/gemini/)

---

# 📝 Notas de Versión

### v1.0.0

- ✅ Sistema completo de gestión de citas
- ✅ Cuatro roles de usuario implementados
- ✅ Chatbot IA integrado
- ✅ Diseño responsive completo
- ✅ API RESTful completa