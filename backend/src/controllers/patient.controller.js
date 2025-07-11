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

// Nuevo método para verificar RUT
exports.checkRutExists = async (req, res) => {
  try {
    const { rut } = req.query;
    const patients = await Patient.getByRut(rut);
    
    if (patients.length > 0) {
      res.json({ 
        exists: true, 
        patient: patients[0] 
      });
    } else {
      res.json({ 
        exists: false 
      });
    }
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

// Nuevo método para actualizar paciente
exports.updatePatient = async (req, res) => {
  try {
    const affectedRows = await Patient.update(req.params.id, req.body);
    if (affectedRows > 0) {
      res.json({ message: 'Paciente actualizado exitosamente', ...req.body });
    } else {
      res.status(404).json({ message: 'Paciente no encontrado' });
    }
  } catch (error) {
    console.error('ERROR AL ACTUALIZAR PACIENTE:', error);
    res.status(500).json({ message: error.message });
  }
};

// Método para buscar paciente por correo electrónico
exports.searchPatientByEmail = async (req, res) => {
    try {
        const { email } = req.query;

        if (!email || email.trim() === '') {
            return res.status(400).json({ message: 'Parámetro "email" es requerido' });
        }

        const patients = await Patient.getByEmail(email);

        // Siempre responde 200 con un arreglo (vacío o no)
        res.json(patients);
    } catch (error) {
        console.error('ERROR AL BUSCAR PACIENTE POR CORREO:', error);
        res.status(500).json({ message: error.message });
    }
};

// Método para buscar paciente por ID
exports.getPatientById = async (req, res) => {
  try {
    const { id } = req.params;
    const patients = await Patient.getById(id); // asegúrate de que esta función exista
    if (patients.length > 0) {
      res.json(patients[0]);
    } else {
      res.status(404).json({ message: 'Paciente no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};