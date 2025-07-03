const mysql = require("mysql2/promise");

async function testNewUser() {
  console.log("🔍 Probando conexión con app_user...\n");

  try {
    const connection = await mysql.createConnection({
      host: "localhost",
      port: 3306,
      user: "app_user",
      password: "",
      database: "gestion_citas",
    });

    console.log("✅ ¡Conexión exitosa con app_user!");

    // Verificar las tablas
    const [tables] = await connection.query("SHOW TABLES");
    console.log(
      "📋 Tablas disponibles:",
      tables.map((t) => Object.values(t)[0])
    );

    // Verificar usuarios de prueba
    const [admins] = await connection.query(
      "SELECT email FROM administrators LIMIT 1"
    );
    const [patients] = await connection.query(
      "SELECT email FROM patients LIMIT 1"
    );

    if (admins.length > 0) {
      console.log("👨‍💼 Admin encontrado:", admins[0].email);
    }
    if (patients.length > 0) {
      console.log("🧑‍⚕️ Paciente encontrado:", patients[0].email);
    }

    await connection.end();

    console.log("\n🎯 ¡Todo configurado correctamente!");
    console.log("🚀 Ahora puedes probar el login en tu aplicación");
  } catch (error) {
    console.error("❌ Error:", error.message);

    if (error.code === "ER_ACCESS_DENIED_ERROR") {
      console.log("💡 El usuario app_user no existe o no tiene permisos");
      console.log("   Asegúrate de ejecutar el script en phpMyAdmin primero");
    }
  }
}

testNewUser();
