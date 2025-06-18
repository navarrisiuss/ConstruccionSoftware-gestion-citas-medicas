const Appointment = require('../models/appointment.model');

exports.getAllAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.getAll();
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAppointmentsByPatient = async (req, res) => {
    try {
        const appointments = await Appointment.getByPatientId(req.params.patientId);
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAppointmentsByPhysician = async (req, res) => {
    try {
        const appointments = await Appointment.getByPhysicianId(req.params.physicianId);
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createAppointment = async (req, res) => {
    try {
        console.log('Datos recibidos:', req.body);
        const newAppointmentId = await Appointment.create(req.body);
        res.status(201).json({ id: newAppointmentId, ...req.body });
    } catch (error) {
        console.error('ERROR AL CREAR CITA:', error);
        res.status(500).json({ message: error.message, stack: error.stack });
    }
};

exports.updateAppointment = async (req, res) => {
    try {
        const affectedRows = await Appointment.update(req.params.id, req.body);
        if (affectedRows > 0) {
            res.json({ message: 'Cita actualizada exitosamente' });
        } else {
            res.status(404).json({ message: 'Cita no encontrada' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteAppointment = async (req, res) => {
    try {
        const affectedRows = await Appointment.delete(req.params.id);
        if (affectedRows > 0) {
            res.json({ message: 'Cita eliminada exitosamente' });
        } else {
            res.status(404).json({ message: 'Cita no encontrada' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};