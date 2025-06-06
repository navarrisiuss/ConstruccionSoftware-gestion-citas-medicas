const Patient = require('../models/patient.model');

exports.getAllPatients = async (req, res) => {
  try {
    const patients = await Patient.getAll();
    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPatientByEmail = async (req, res) => {
  try {
    const patients = await Patient.getByEmail(req.query.email);
    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createPatient = async (req, res) => {
  try {
    const newPatientId = await Patient.create(req.body);
    res.status(201).json({ id: newPatientId, ...req.body });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.createPatient = async (req, res) => {
  try {
    console.log('Datos recibidos:', req.body);  
    const newPatientId = await Patient.create(req.body);
    res.status(201).json({ id: newPatientId, ...req.body });
  } catch (error) {
    console.error('ERROR AL CREAR PACIENTE:', error);  
    res.status(500).json({ message: error.message, stack: error.stack });
  }
};