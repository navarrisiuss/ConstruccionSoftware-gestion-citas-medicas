const Patient = require('../models/patient.model');
const Physician = require('../models/physician.model');
const Assistant = require('../models/assistant.model');
const Admin = require('../models/admin.model');

exports.login = async (req, res) => {
    try {
        const { email } = req.query;
        
        // Buscar en pacientes
        const patients = await Patient.getByEmail(email);
        if (patients.length > 0) {
            return res.json(patients.map(user => ({ ...user, role: 'patient' })));
        }
        
        // Buscar en médicos
        const physicians = await Physician.getByEmail(email);
        if (physicians.length > 0) {
            return res.json(physicians.map(user => ({ ...user, role: 'physician' })));
        }
        
        // Buscar en asistentes
        const assistants = await Assistant.getByEmail(email);
        if (assistants.length > 0) {
            return res.json(assistants.map(user => ({ ...user, role: 'assistant' })));
        }
        
        // Buscar en administradores
        const admins = await Admin.getByEmail(email);
        if (admins.length > 0) {
            return res.json(admins.map(user => ({ ...user, role: 'admin' })));
        }
        
        // Si no se encuentra en ninguno
        return res.json([]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};