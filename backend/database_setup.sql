-- Script para configurar la base de datos del sistema de gestión de citas médicas
-- Ejecutar este script en MySQL Workbench o desde la línea de comandos

-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS gestion_citas;
USE gestion_citas;

-- Tabla de administradores
CREATE TABLE IF NOT EXISTS administrators (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    paternalLastName VARCHAR(100) NOT NULL,
    maternalLastName VARCHAR(100),
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de médicos
CREATE TABLE IF NOT EXISTS physicians (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    paternalLastName VARCHAR(100) NOT NULL,
    maternalLastName VARCHAR(100),
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    specialty VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de asistentes
CREATE TABLE IF NOT EXISTS assistants (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    paternalLastName VARCHAR(100) NOT NULL,
    maternalLastName VARCHAR(100),
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de pacientes
CREATE TABLE IF NOT EXISTS patients (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    paternalLastName VARCHAR(100) NOT NULL,
    maternalLastName VARCHAR(100),
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rut VARCHAR(20) UNIQUE NOT NULL,
    birthDate DATE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    gender TINYINT NOT NULL COMMENT '0=Male, 1=Female',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de citas médicas
CREATE TABLE IF NOT EXISTS appointments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    patient_id INT NOT NULL,
    physician_id INT NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    reason TEXT,
    status ENUM('scheduled', 'confirmed', 'completed', 'cancelled') DEFAULT 'scheduled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (physician_id) REFERENCES physicians(id) ON DELETE CASCADE
);

-- Insertar datos de ejemplo
-- Administrador por defecto
INSERT INTO administrators (name, paternalLastName, maternalLastName, email, password) 
VALUES ('Admin', 'Sistema', 'Principal', 'admin@hospital.com', 'admin123')
ON DUPLICATE KEY UPDATE name=name;

-- Médico de ejemplo
INSERT INTO physicians (name, paternalLastName, maternalLastName, email, password, specialty) 
VALUES ('Dr. Juan', 'Pérez', 'González', 'juan.perez@hospital.com', 'doctor123', 'Cardiología')
ON DUPLICATE KEY UPDATE name=name;

-- Asistente de ejemplo
INSERT INTO assistants (name, paternalLastName, maternalLastName, email, password) 
VALUES ('María', 'García', 'López', 'maria.garcia@hospital.com', 'assistant123')
ON DUPLICATE KEY UPDATE name=name;

-- Paciente de ejemplo (además del que ya existe)
INSERT INTO patients (name, paternalLastName, maternalLastName, email, password, rut, birthDate, phone, address, gender) 
VALUES ('Juan', 'Silva', 'Castro', 'juan.silva@email.com', 'patient123', '12345678-9', '1990-01-15', '56912345678', 'Av. Principal 123, Santiago', 0)
ON DUPLICATE KEY UPDATE name=name;

-- Mostrar mensaje de confirmación
SELECT 'Base de datos configurada exitosamente!' as mensaje;