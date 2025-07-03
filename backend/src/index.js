const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

// Importar rutas
const patientRoutes = require("./routes/patient.routes");
const physicianRoutes = require("./routes/physician.routes");
const assistantRoutes = require("./routes/assistant.routes");
const adminRoutes = require("./routes/admin.routes");
const appointmentRoutes = require("./routes/appointment.routes");
const authRoutes = require("./routes/auth.routes");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware de logging para debug
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Test de base de datos
app.get("/test-db", async (req, res) => {
  try {
    const db = require("./config/db.config");
    const [rows] = await db.query("SELECT 1 as test");
    res.json({ success: true, data: rows, message: "Conexión a BD exitosa" });
  } catch (error) {
    console.error("❌ ERROR DE CONEXIÓN DB:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: "Error de conexión a la base de datos",
    });
  }
});

// Rutas de la API
app.use("/api/patients", patientRoutes);
app.use("/api/physicians", physicianRoutes);
app.use("/api/assistants", assistantRoutes);
app.use("/api/admins", adminRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/auth", authRoutes);

// Ruta principal
app.get("/", (req, res) => {
  res.json({
    message: "API de Gestión de Citas Médicas funcionando correctamente",
    timestamp: new Date().toISOString(),
    endpoints: [
      "/api/auth - Autenticación",
      "/api/patients - Gestión de pacientes",
      "/api/physicians - Gestión de médicos",
      "/api/assistants - Gestión de asistentes",
      "/api/admins - Gestión de administradores",
      "/api/appointments - Gestión de citas",
      "/test-db - Prueba de conexión a BD",
    ],
  });
});

// Middleware de manejo de errores global
app.use((error, req, res, next) => {
  console.error("❌ Error no manejado:", error);
  res.status(500).json({
    message: "Error interno del servidor",
    error:
      process.env.NODE_ENV === "development" ? error.message : "Error interno",
  });
});

// Manejar rutas no encontradas
app.use("*", (req, res) => {
  res.status(404).json({ message: "Ruta no encontrada" });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📊 Endpoints disponibles:`);
  console.log(`   GET  http://localhost:${PORT}/`);
  console.log(`   GET  http://localhost:${PORT}/test-db`);
  console.log(`   GET  http://localhost:${PORT}/api/auth`);
});
