const Physician = require("../models/physician.model");

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
      res.status(404).json({ message: "Médico no encontrado" });
    }
  } catch (error) {
    console.error("ERROR AL OBTENER MÉDICO POR ID:", error);
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

exports.getPhysiciansBySpecialty = async (req, res) => {
  try {
    const specialty = req.query.specialty;
    if (!specialty) {
      return res.status(400).json({ message: "Especialidad es requerida" });
    }
    const physicians = await Physician.getBySpecialty(specialty);
    res.json(physicians);
  } catch (error) {
    console.error("ERROR AL OBTENER MÉDICOS POR ESPECIALIDAD:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.updatePhysician = async (req, res) => {
  try {
    const physicianId = req.params.id;
    const updateData = req.body;

    const success = await Physician.update(physicianId, updateData);
    if (success) {
      const updatedPhysician = await Physician.getById(physicianId);
      res.json(updatedPhysician);
    } else {
      res.status(404).json({ message: "Médico no encontrado" });
    }
  } catch (error) {
    console.error("ERROR AL ACTUALIZAR MÉDICO:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.deletePhysician = async (req, res) => {
  try {
    const physicianId = req.params.id;
    const success = await Physician.delete(physicianId);

    if (success) {
      res.json({ message: "Médico eliminado exitosamente" });
    } else {
      res.status(404).json({ message: "Médico no encontrado" });
    }
  } catch (error) {
    console.error("ERROR AL ELIMINAR MÉDICO:", error);
    res.status(500).json({ message: error.message });
  }
};
