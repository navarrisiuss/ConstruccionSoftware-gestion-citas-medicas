const Patient = require('../models/patient.model');
const Physician = require('../models/physician.model');

exports.login = async (req, res) => {
  try {
    const { email } = req.query;
    

    const patients = await Patient.getByEmail(email);
    if (patients.length > 0) {
      return res.json(patients);
    }
    

    const physicians = await Physician.getByEmail(email);
    if (physicians.length > 0) {
      return res.json(physicians);
    }
    

    return res.json([]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};