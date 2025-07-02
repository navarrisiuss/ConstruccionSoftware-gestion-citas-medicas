const Appointment = require('../models/appointment.model');
const db = require('../config/db.config'); // ✅ Agregar esta importación

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
        
        // Verificar si ya existe una cita en el mismo día, hora y médico
        const conflictingAppointment = await Appointment.checkConflict(
            req.body.physician_id, 
            req.body.date, 
            req.body.time
        );
        
        if (conflictingAppointment) {
            return res.status(409).json({ 
                message: 'Ya existe una cita agendada para este médico en la fecha y hora seleccionada',
                conflict: true
            });
        }
        
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

// ✅ Actualizar estado de cita - MÉTODO CORREGIDO
exports.updateAppointmentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        console.log('Actualizando estado de cita:', id, 'nuevo estado:', status);
        
        const validStatuses = ['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Estado inválido' });
        }

        const [result] = await db.query(
            'UPDATE appointments SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [status, id]
        );

        console.log('Resultado de la actualización:', result);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Cita no encontrada' });
        }

        res.json({ message: 'Estado actualizado correctamente', status });
    } catch (error) {
        console.error('Error actualizando estado:', error);
        res.status(500).json({ message: error.message });
    }
};

// ✅ Cancelar cita con detalles - MÉTODO CORREGIDO
exports.cancelAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, cancellation_reason, cancellation_details, cancelled_by } = req.body;

        console.log('Cancelando cita:', id, 'datos:', req.body);

        const [result] = await db.query(`
            UPDATE appointments 
            SET status = ?, 
                cancellation_reason = ?, 
                cancellation_details = ?, 
                cancelled_by = ?, 
                cancelled_at = CURRENT_TIMESTAMP,
                updated_at = CURRENT_TIMESTAMP 
            WHERE id = ?
        `, [status, cancellation_reason, cancellation_details, cancelled_by, id]);

        console.log('Resultado de la cancelación:', result);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Cita no encontrada' });
        }

        res.json({ 
            message: 'Cita cancelada correctamente',
            cancellation_reason,
            cancelled_at: new Date()
        });
    } catch (error) {
        console.error('Error cancelando cita:', error);
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