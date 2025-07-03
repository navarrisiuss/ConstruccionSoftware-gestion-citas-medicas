const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

async function resetMySQLPassword() {
  console.log("🔧 Reseteando contraseña de MySQL en XAMPP...\n");

  // Rutas comunes donde puede estar XAMPP
  const xamppPaths = [
    "C:\\xampp\\mysql\\bin\\mysql.exe",
    "C:\\Program Files\\XAMPP\\mysql\\bin\\mysql.exe",
    "C:\\Program Files (x86)\\XAMPP\\mysql\\bin\\mysql.exe",
  ];

  let mysqlPath = null;

  // Buscar MySQL
  for (const path of xamppPaths) {
    if (fs.existsSync(path)) {
      mysqlPath = path;
      console.log(`✅ MySQL encontrado en: ${path}`);
      break;
    }
  }

  if (!mysqlPath) {
    console.log("❌ No se encontró MySQL de XAMPP en las rutas comunes");
    console.log("💡 Soluciones alternativas:");
    console.log("   1. Busca manualmente xampp-control.exe y ábrelo");
    console.log("   2. Ve a MySQL → Config → my.ini");
    console.log('   3. Agrega "skip-grant-tables" bajo [mysqld]');
    console.log("   4. Reinicia MySQL desde el panel");
    return;
  }

  // Crear script SQL para resetear contraseña
  const sqlScript = `
-- Resetear contraseña de root en MySQL
UPDATE mysql.user SET authentication_string = '', plugin = 'mysql_native_password' WHERE User = 'root' AND Host = 'localhost';
FLUSH PRIVILEGES;
-- Crear base de datos si no existe
CREATE DATABASE IF NOT EXISTS gestion_citas;
-- Mostrar confirmación
SELECT 'Contraseña reseteada correctamente' AS mensaje;
`;

  const scriptPath = path.join(__dirname, "reset_password.sql");
  fs.writeFileSync(scriptPath, sqlScript);

  console.log("📝 Script SQL creado:", scriptPath);
  console.log("\n🔧 Para ejecutar manualmente:");
  console.log(`1. Para MySQL desde XAMPP`);
  console.log(`2. Ejecuta: ${mysqlPath} -u root < "${scriptPath}"`);
  console.log(`3. Reinicia MySQL`);
  console.log(`4. Ejecuta nuestro test-connection.js`);

  // Intentar ejecutar automáticamente
  console.log("\n🚀 Intentando ejecutar automáticamente...");

  exec(`"${mysqlPath}" -u root < "${scriptPath}"`, (error, stdout, stderr) => {
    if (error) {
      console.log("❌ No se pudo ejecutar automáticamente");
      console.log("💡 Ejecuta manualmente los pasos arriba");
    } else {
      console.log("✅ Script ejecutado exitosamente");
      console.log("🔄 Reinicia MySQL desde XAMPP y prueba la conexión");
    }
  });
}

resetMySQLPassword();
