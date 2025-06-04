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
    res.status(500).json({ message: error.message });
  }
};