const Physician = require('../models/physician.model');

exports.getAllPhysicians = async (req, res) => {
  try {
    const physicians = await Physician.getAll();
    res.json(physicians);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPhysicianByEmail = async (req, res) => {
  try {
    const physicians = await Physician.getByEmail(req.query.email);
    res.json(physicians);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createPhysician = async (req, res) => {
  try {
    const newPhysicianId = await Physician.create(req.body);
    res.status(201).json({ id: newPhysicianId, ...req.body });
  } catch (error) {
    console.error('ERROR AL CREAR MÉDICO:', error);
    res.status(500).json({ message: error.message });
  }
};

// Nuevo método para actualizar médico
exports.updatePhysician = async (req, res) => {
  try {
    const affectedRows = await Physician.update(req.params.id, req.body);
    if (affectedRows > 0) {
      res.json({ message: 'Médico actualizado exitosamente', ...req.body });
    } else {
      res.status(404).json({ message: 'Médico no encontrado' });
    }
  } catch (error) {
    console.error('ERROR AL ACTUALIZAR MÉDICO:', error);
    res.status(500).json({ message: error.message, stack: error.stack });
  }
};

exports.deletePhysician = async (req, res) => {
  try {
    const deletedRows = await Physician.delete(req.params.id);
    if (deletedRows > 0) {
      res.json({ message: 'Médico eliminado correctamente' });
    } else {
      res.status(404).json({ message: 'Médico no encontrado' });
    }
  } catch (error) {
    console.error('ERROR AL ELIMINAR MÉDICO:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getPhysiciansBySpecialty = async (req, res) => {
    try {
        const specialty = req.query.specialty;
        if (!specialty) {
        return res.status(400).json({ message: 'Especialidad es requerida' });
        }

        const physicians = await Physician.getBySpecialty(specialty);
        res.json(physicians);
    } catch (error) {
        console.error('ERROR AL OBTENER MÉDICOS POR ESPECIALIDAD:', error);
        res.status(500).json({ message: error.message });
    }
}