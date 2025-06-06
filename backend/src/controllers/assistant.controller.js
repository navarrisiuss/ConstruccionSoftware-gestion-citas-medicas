const Assistant = require('../models/assistant.model');

exports.getAllAssistants = async (req, res) => {
    try {
        const assistants = await Assistant.getAll();
        res.json(assistants);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAssistantByEmail = async (req, res) => {
    try {
        const assistants = await Assistant.getByEmail(req.query.email);
        res.json(assistants);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createAssistant = async (req, res) => {
    try {
        console.log('Datos recibidos:', req.body);
        const newAssistantId = await Assistant.create(req.body);
        res.status(201).json({ id: newAssistantId, ...req.body });
    } catch (error) {
        console.error('ERROR AL CREAR ASISTENTE:', error);
        res.status(500).json({ message: error.message, stack: error.stack });
    }
};

exports.updateAssistant = async (req, res) => {
    try {
        const affectedRows = await Assistant.update(req.params.id, req.body);
        if (affectedRows > 0) {
            res.json({ message: 'Asistente actualizado exitosamente' });
        } else {
            res.status(404).json({ message: 'Asistente no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteAssistant = async (req, res) => {
    try {
        const affectedRows = await Assistant.delete(req.params.id);
        if (affectedRows > 0) {
            res.json({ message: 'Asistente eliminado exitosamente' });
        } else {
            res.status(404).json({ message: 'Asistente no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};