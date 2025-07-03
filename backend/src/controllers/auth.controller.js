const Patient = require("../models/patient.model");
const Physician = require("../models/physician.model");
const Assistant = require("../models/assistant.model");
const Admin = require("../models/admin.model");

exports.login = async (req, res) => {
  try {
    const { email } = req.query;

    // Validar que el email esté presente
    if (!email) {
      return res.status(400).json({ message: "Email es requerido" });
    }

    console.log("🔍 Intentando login para email:", email);

    // Buscar en pacientes
    try {
      const patients = await Patient.getByEmail(email);
      if (patients.length > 0) {
        console.log("✅ Usuario encontrado en pacientes");
        return res.json(patients.map((user) => ({ ...user, role: "patient" })));
      }
    } catch (dbError) {
      console.error("❌ Error buscando en pacientes:", dbError.message);
    }

    // Buscar en médicos
    try {
      const physicians = await Physician.getByEmail(email);
      if (physicians.length > 0) {
        console.log("✅ Usuario encontrado en médicos");
        return res.json(
          physicians.map((user) => ({ ...user, role: "physician" }))
        );
      }
    } catch (dbError) {
      console.error("❌ Error buscando en médicos:", dbError.message);
    }

    // Buscar en asistentes
    try {
      const assistants = await Assistant.getByEmail(email);
      if (assistants.length > 0) {
        console.log("✅ Usuario encontrado en asistentes");
        return res.json(
          assistants.map((user) => ({ ...user, role: "assistant" }))
        );
      }
    } catch (dbError) {
      console.error("❌ Error buscando en asistentes:", dbError.message);
    }

    // Buscar en administradores
    try {
      const admins = await Admin.getByEmail(email);
      if (admins.length > 0) {
        console.log("✅ Usuario encontrado en administradores");
        return res.json(admins.map((user) => ({ ...user, role: "admin" })));
      }
    } catch (dbError) {
      console.error("❌ Error buscando en administradores:", dbError.message);
    }

    // Si no se encuentra en ninguno
    console.log("⚠️ Usuario no encontrado para email:", email);
    return res.json([]);
  } catch (error) {
    console.error("❌ Error general en login:", error.message);
    res.status(500).json({
      message: "Error interno del servidor",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};
