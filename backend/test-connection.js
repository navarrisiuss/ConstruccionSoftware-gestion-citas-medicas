const mysql = require("mysql2/promise");

async function testConnection() {
  console.log("🔍 Probando conexión directa a MySQL de XAMPP...\n");

  try {
    // Intentar conectar sin base de datos específica primero
    const connection = await mysql.createConnection({
      host: "localhost",
      port: 3306,
      user: "root",
      password: "", // XAMPP por defecto no tiene contraseña
    });

    console.log("✅ ¡Conexión exitosa a MySQL!");

    // Listar bases de datos disponibles
    console.log("\n📋 Bases de datos disponibles:");
    const [databases] = await connection.query("SHOW DATABASES");
    databases.forEach((db) => {
      console.log(`   - ${Object.values(db)[0]}`);
    });

    // Verificar si existe gestion_citas
    const [existingDb] = await connection.query(
      'SHOW DATABASES LIKE "gestion_citas"'
    );

    if (existingDb.length === 0) {
      console.log('\n🔧 Creando base de datos "gestion_citas"...');
      await connection.query("CREATE DATABASE gestion_citas");
      console.log('✅ Base de datos "gestion_citas" creada exitosamente');
    } else {
      console.log('\n✅ La base de datos "gestion_citas" ya existe');
    }

    await connection.end();

    console.log("\n🎯 ¡Todo configurado correctamente!");
    console.log("   Usuario: root");
    console.log("   Contraseña: (vacía)");
    console.log("   Base de datos: gestion_citas");

    return true;
  } catch (error) {
    console.error("❌ Error de conexión:", error.message);

    if (error.code === "ECONNREFUSED") {
      console.log("\n💡 Soluciones posibles:");
      console.log("   1. Asegúrate de que XAMPP esté ejecutándose");
      console.log("   2. Inicia MySQL desde el panel de control de XAMPP");
      console.log("   3. Verifica que el puerto 3306 no esté bloqueado");
    } else if (error.code === "ER_ACCESS_DENIED_ERROR") {
      console.log("\n💡 El usuario root tiene contraseña configurada");
      console.log("   Verifica las credenciales en phpMyAdmin");
    }

    return false;
  }
}

async function findPassword() {
  console.log("🔐 Buscando la contraseña correcta para MySQL de XAMPP...\n");

  // Contraseñas más comunes en XAMPP
  const passwords = [
    "",
    "root",
    "password",
    "123456",
    "admin",
    "xampp",
    "mysql",
    "localhost",
  ];

  for (const password of passwords) {
    const description = password === "" ? "(sin contraseña)" : `"${password}"`;
    console.log(`🔍 Probando contraseña: ${description}`);

    try {
      const connection = await mysql.createConnection({
        host: "localhost",
        port: 3306,
        user: "root",
        password: password,
      });

      console.log(`✅ ¡CONTRASEÑA ENCONTRADA! Password: "${password}"`);

      // Crear base de datos si no existe
      const [existingDb] = await connection.query(
        'SHOW DATABASES LIKE "gestion_citas"'
      );

      if (existingDb.length === 0) {
        console.log('\n🔧 Creando base de datos "gestion_citas"...');
        await connection.query("CREATE DATABASE gestion_citas");
        console.log("✅ Base de datos creada exitosamente");
      } else {
        console.log('\n✅ Base de datos "gestion_citas" ya existe');
      }

      await connection.end();

      console.log("\n🎯 Configuración encontrada:");
      console.log(`   Usuario: root`);
      console.log(`   Contraseña: "${password}"`);
      console.log(`   Base de datos: gestion_citas`);
      console.log("\n📝 Actualiza tu archivo sql.env con:");
      console.log(`   DB_PASSWORD=${password}`);

      return password;
    } catch (error) {
      console.log(`   ❌ Falló: ${error.message.split(":")[0]}`);
    }
  }

  console.log("\n❌ No se encontró la contraseña correcta");
  console.log("💡 Opciones:");
  console.log("   1. Abre XAMPP Control Panel → MySQL → Config → my.ini");
  console.log("   2. Resetea la contraseña desde phpMyAdmin");
  console.log("   3. Dime qué credenciales usas en phpMyAdmin");
}

testConnection();
findPassword();
