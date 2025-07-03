
-- Resetear contraseña de root en MySQL
UPDATE mysql.user SET authentication_string = '', plugin = 'mysql_native_password' WHERE User = 'root' AND Host = 'localhost';
FLUSH PRIVILEGES;
-- Crear base de datos si no existe
CREATE DATABASE IF NOT EXISTS gestion_citas;
-- Mostrar confirmación
SELECT 'Contraseña reseteada correctamente' AS mensaje;
