const mysql = require("mysql2/promise");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../sql.env") });

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "gestion_citas",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true,
};

console.log("🔧 Configuración de BD:", {
  host: dbConfig.host,
  port: dbConfig.port,
  user: dbConfig.user,
  database: dbConfig.database,
});

// Intentar crear el pool de conexiones
let pool;
let usingFallback = false;

try {
  pool = mysql.createPool(dbConfig);

  // Probar la conexión
  pool
    .getConnection()
    .then((connection) => {
      console.log("✅ Conexión a MySQL establecida correctamente");
      connection.release();
    })
    .catch(async (error) => {
      console.error("❌ Error conectando a MySQL:", error.message);

      if (error.code === "ECONNREFUSED") {
        console.log("💡 XAMPP MySQL no está ejecutándose");
      } else if (error.code === "ER_ACCESS_DENIED_ERROR") {
        console.log("💡 Problema de autenticación MySQL");
        console.log("🔧 Pasos para solucionarlo:");
        console.log("   1. Abre XAMPP Control Panel");
        console.log("   2. Para MySQL → Config → my.ini");
        console.log("   3. Agrega 'skip-grant-tables' bajo [mysqld]");
        console.log("   4. Reinicia MySQL");
      } else if (error.code === "ER_BAD_DB_ERROR") {
        console.log("💡 La base de datos 'gestion_citas' no existe");

        // Intentar crear la base de datos
        try {
          const tempConfig = { ...dbConfig };
          delete tempConfig.database;
          const tempPool = mysql.createPool(tempConfig);
          const tempConnection = await tempPool.getConnection();

          await tempConnection.query(
            "CREATE DATABASE IF NOT EXISTS gestion_citas"
          );
          console.log("✅ Base de datos 'gestion_citas' creada");
          tempConnection.release();
          tempPool.end();
        } catch (createError) {
          console.log(
            "❌ No se pudo crear la base de datos:",
            createError.message
          );
        }
      }

      console.log("\n🚀 Para continuar desarrollando, sigue estos pasos:");
      console.log("   1. Abre XAMPP Control Panel");
      console.log("   2. Asegúrate de que MySQL esté corriendo");
      console.log(
        "   3. Si hay problemas de contraseña, sigue las instrucciones arriba"
      );
    });
} catch (error) {
  console.error("❌ Error creando pool de conexiones:", error.message);
}

module.exports = pool;
