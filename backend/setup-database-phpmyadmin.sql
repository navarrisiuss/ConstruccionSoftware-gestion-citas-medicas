-- Script corregido para configurar MySQL de XAMPP
-- Ejecuta este script en phpMyAdmin

-- 1. Crear la base de datos si no existe
CREATE DATABASE IF NOT EXISTS gestion_citas;

-- 2. Usar la base de datos
USE gestion_citas;

-- 3. Crear un nuevo usuario específico para la aplicación (más seguro)
-- En lugar de modificar root, creamos un usuario dedicado
CREATE USER IF NOT EXISTS 'app_user'@'localhost' IDENTIFIED BY '';
GRANT ALL PRIVILEGES ON gestion_citas.* TO 'app_user'@'localhost';

-- 4. También permitir acceso sin contraseña para root desde localhost
-- Método alternativo que funciona en MySQL moderno
GRANT ALL PRIVILEGES ON gestion_citas.* TO 'root'@'localhost';

-- 5. Aplicar los cambios
FLUSH PRIVILEGES;

-- 6. Crear las tablas principales del sistema

-- Tabla de pacientes
CREATE TABLE IF NOT EXISTS patients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    birth_date DATE,
    gender ENUM('M', 'F', 'O') DEFAULT 'O',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de médicos
CREATE TABLE IF NOT EXISTS physicians (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    specialty VARCHAR(100),
    license_number VARCHAR(50) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de asistentes
CREATE TABLE IF NOT EXISTS assistants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    department VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de administradores
CREATE TABLE IF NOT EXISTS administrators (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de citas
CREATE TABLE IF NOT EXISTS appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT,
    physician_id INT,
    appointment_date DATETIME NOT NULL,
    status ENUM('scheduled', 'completed', 'cancelled') DEFAULT 'scheduled',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (physician_id) REFERENCES physicians(id) ON DELETE CASCADE
);

-- Insertar datos de prueba

-- Administrador de prueba
INSERT IGNORE INTO administrators (name, email, password, phone) VALUES
('Admin Principal', 'admin@clinic.com', 'admin123', '555-0001');

-- Médico de prueba
INSERT IGNORE INTO physicians (name, email, password, specialty, license_number, phone) VALUES
('Dr. Juan Pérez', 'doctor@clinic.com', 'doctor123', 'Medicina General', 'LIC123456', '555-0002');

-- Asistente de prueba
INSERT IGNORE INTO assistants (name, email, password, department, phone) VALUES
('María González', 'assistant@clinic.com', 'assistant123', 'Recepción', '555-0003');

-- Paciente de prueba
INSERT IGNORE INTO patients (name, email, password, phone, birth_date, gender) VALUES
('Carlos Rodríguez', 'patient@clinic.com', 'patient123', '555-0004', '1990-05-15', 'M');

-- Mostrar mensaje de confirmación
SELECT 'Base de datos configurada correctamente' AS mensaje;
SELECT 'Usuarios de prueba creados:' AS info;
SELECT 'admin@clinic.com (admin123)' AS admin_login;
SELECT 'doctor@clinic.com (doctor123)' AS doctor_login;
SELECT 'assistant@clinic.com (assistant123)' AS assistant_login;
SELECT 'patient@clinic.com (patient123)' AS patient_login;