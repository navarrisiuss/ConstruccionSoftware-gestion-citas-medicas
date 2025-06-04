const Patient = require('../models/patient.model');
const Physician = require('../models/physician.model');

exports.login = async (req, res) => {
  try {
    const { email } = req.query;
    
    // Primero buscar en pacientes
    const patients = await Patient.getByEmail(email);
    if (patients.length > 0) {
      return res.json(patients);
    }
    
    // Si no se encuentra en pacientes, buscar en médicos
    const physicians = await Physician.getByEmail(email);
    if (physicians.length > 0) {
      return res.json(physicians);
    }
    
    // Si no se encuentra en ninguno
    return res.json([]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};