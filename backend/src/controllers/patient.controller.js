const Patient = require('../models/patient.model');
const db = require('../config/db.config');

exports.getAllPatients = async (req, res) => {
  try {
    const includeInactive = req.query.includeInactive === 'true';
    const patients = await Patient.getAll(includeInactive);
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

exports.checkRutExists = async (req, res) => {
  try {
    const { rut } = req.query;
    const includeInactive = req.query.includeInactive === 'true';
    
    // ✅ Permitir buscar pacientes inactivos para administración
    const patients = includeInactive 
      ? await Patient.getByRutIncludeInactive(rut)
      : await Patient.getByRut(rut);
    
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

exports.deactivatePatient = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Desactivando paciente con ID:', id);
    
    // Verificar si el paciente existe
    const patients = await Patient.getById(id, true);
    if (patients.length === 0) {
      return res.status(404).json({ message: 'Paciente no encontrado' });
    }

    // ✅ CORREGIR: Verificar si ya está desactivado usando active
    if (patients[0].active === 0 || patients[0].active === false) {
      return res.status(400).json({ message: 'El paciente ya está desactivado' });
    }
    
    const affectedRows = await Patient.deactivate(id);
    
    if (affectedRows > 0) {
      res.json({ 
        message: 'Paciente desactivado exitosamente',
        patientId: id,
        deactivated: true
      });
    } else {
      res.status(404).json({ message: 'No se pudo desactivar el paciente' });
    }
  } catch (error) {
    console.error('Error desactivando paciente:', error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ NUEVO: Reactivar paciente
exports.reactivatePatient = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Reactivando paciente con ID:', id);
    
    // Verificar si el paciente existe
    const patients = await Patient.getById(id, true);
    if (patients.length === 0) {
      return res.status(404).json({ message: 'Paciente no encontrado' });
    }

    // ✅ CORREGIR: Verificar si ya está activo usando active
    if (patients[0].active === 1 || patients[0].active === true) {
      return res.status(400).json({ message: 'El paciente ya está activo' });
    }
    
    const affectedRows = await Patient.reactivate(id);
    
    if (affectedRows > 0) {
      res.json({ 
        message: 'Paciente reactivado exitosamente',
        patientId: id,
        reactivated: true
      });
    } else {
      res.status(404).json({ message: 'No se pudo reactivar el paciente' });
    }
  } catch (error) {
    console.error('Error reactivando paciente:', error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ MANTENER para casos extremos
exports.deletePatient = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('ELIMINACIÓN PERMANENTE - Paciente ID:', id);
    
    // ✅ Solo permitir eliminación permanente si el paciente está desactivado
    const patients = await Patient.getById(id, true);
    if (patients.length === 0) {
      return res.status(404).json({ message: 'Paciente no encontrado' });
    }

    // ✅ CORREGIR: Verificar que esté desactivado usando active
    if (patients[0].active === 1 || patients[0].active === true) {
      return res.status(400).json({ 
        message: 'Debe desactivar el paciente antes de eliminarlo permanentemente',
        suggestion: 'Use la función de desactivar en su lugar'
      });
    }
    
    // Verificar citas médicas
    const [appointments] = await db.query(
      'SELECT COUNT(*) as count FROM appointments WHERE patient_id = ?', 
      [id]
    );
    
    if (appointments[0].count > 0) {
      return res.status(409).json({ 
        message: 'No se puede eliminar permanentemente el paciente porque tiene citas médicas asociadas',
        appointmentCount: appointments[0].count,
        suggestion: 'Mantenga el paciente desactivado para preservar el historial médico'
      });
    }
    
    const affectedRows = await Patient.delete(id);
    
    if (affectedRows > 0) {
      res.json({ 
        message: 'Paciente eliminado permanentemente',
        deletedId: id 
      });
    } else {
      res.status(404).json({ message: 'No se pudo eliminar el paciente' });
    }
  } catch (error) {
    console.error('Error eliminando paciente permanentemente:', error);
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