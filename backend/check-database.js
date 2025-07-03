const mysql = require("mysql2/promise");

async function checkDatabase() {
  console.log("🔍 Verificando configuración de la base de datos...\n");

  // Probar diferentes configuraciones comunes de XAMPP
  const configs = [
    { user: "root", password: "", desc: "Sin contraseña" },
    { user: "root", password: "root", desc: "Contraseña: root" },
    { user: "root", password: "password", desc: "Contraseña: password" },
    { user: "root", password: "123456", desc: "Contraseña: 123456" },
  ];

  for (const config of configs) {
    console.log(`🔐 Probando configuración: ${config.desc}`);

    try {
      const connection = await mysql.createConnection({
        host: "localhost",
        port: 3306,
        user: config.user,
        password: config.password,
      });

      console.log(
        `✅ ¡Conexión exitosa! Usuario: ${config.user}, Contraseña: "${config.password}"`
      );

      // Verificar si la base de datos existe
      const [databases] = await connection.query(
        'SHOW DATABASES LIKE "gestion_citas"'
      );

      if (databases.length === 0) {
        console.log('❌ La base de datos "gestion_citas" no existe');
        console.log("🔧 Creando base de datos...");

        await connection.query("CREATE DATABASE IF NOT EXISTS gestion_citas");
        console.log('✅ Base de datos "gestion_citas" creada');
      } else {
        console.log('✅ Base de datos "gestion_citas" ya existe');
      }

      await connection.end();

      console.log("\n🎯 Configuración correcta encontrada:");
      console.log(`   Usuario: ${config.user}`);
      console.log(`   Contraseña: "${config.password}"`);
      console.log("\n📝 Actualiza tu archivo sql.env con estos valores");

      return { user: config.user, password: config.password };
    } catch (error) {
      console.log(`❌ Falló: ${error.message}`);
    }
  }

  console.log("\n❌ No se pudo conectar con ninguna configuración");
  console.log(
    "💡 Abre phpMyAdmin de XAMPP (http://localhost/phpmyadmin) para verificar las credenciales"
  );
}

checkDatabase();
