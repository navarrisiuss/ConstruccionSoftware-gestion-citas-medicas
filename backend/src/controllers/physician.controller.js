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

exports.getPhysicianById = async (req, res) => {
    try {
        const physician = await Physician.getById(req.params.id);
        if (physician) {
            res.json(physician);
        } else {
            res.status(404).json({ message: 'Médico no encontrado' });
        }
    } catch (error) {
        console.error('ERROR AL OBTENER MÉDICO POR ID:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.createPhysician = async (req, res) => {
  try {
    const newPhysicianId = await Physician.create(req.body);
    res.status(201).json({ id: newPhysicianId, ...req.body });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};