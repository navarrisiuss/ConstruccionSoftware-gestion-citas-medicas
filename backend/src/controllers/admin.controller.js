const Admin = require('../models/admin.model');

exports.getAllAdmins = async (req, res) => {
    try {
        const admins = await Admin.getAll();
        res.json(admins);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAdminByEmail = async (req, res) => {
    try {
        const admins = await Admin.getByEmail(req.query.email);
        res.json(admins);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createAdmin = async (req, res) => {
    try {
        console.log('Datos recibidos:', req.body);
        const newAdminId = await Admin.create(req.body);
        res.status(201).json({ id: newAdminId, ...req.body });
    } catch (error) {
        console.error('ERROR AL CREAR ADMIN:', error);
        res.status(500).json({ message: error.message, stack: error.stack });
    }
};

exports.updateAdmin = async (req, res) => {
    try {
        const affectedRows = await Admin.update(req.params.id, req.body);
        if (affectedRows > 0) {
            res.json({ message: 'Admin actualizado exitosamente' });
        } else {
            res.status(404).json({ message: 'Admin no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteAdmin = async (req, res) => {
    try {
        const affectedRows = await Admin.delete(req.params.id);
        if (affectedRows > 0) {
            res.json({ message: 'Admin eliminado exitosamente' });
        } else {
            res.status(404).json({ message: 'Admin no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};