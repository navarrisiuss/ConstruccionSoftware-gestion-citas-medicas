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

exports.getAllAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.getAll(); // tu modelo debe tener esto
        res.json(appointments);
    } catch (error) {
        console.error('ERROR AL OBTENER TODAS LAS CITAS:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.createAppointment = async (req, res) => {
    try {
        console.log('Datos recibidos:', req.body);
        
        const appointmentData = {
            patient_id: req.body.patient_id,
            physician_id: req.body.physician_id,
            date: req.body.date,
            time: req.body.time,
            reason: req.body.reason,
            status: req.body.status || 'scheduled',
            priority: req.body.priority || 'normal',
            notes: req.body.notes || '',
            medical_notes: req.body.medical_notes || '',
            preparation_notes: req.body.preparation_notes || '', // ✅ ASEGURAR que se incluya
            specialty: req.body.specialty || '',
            location: req.body.location || ''
        };
        
        console.log('Datos procesados para guardar:', appointmentData);
        
        const appointmentId = await Appointment.create(appointmentData);
        
        res.status(201).json({ 
            id: appointmentId, 
            message: 'Cita creada exitosamente',
            preparation_notes: appointmentData.preparation_notes // ✅ CONFIRMAR en respuesta
        });
    } catch (error) {
        console.error('Error creando cita:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.updateAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const appointmentData = req.body;
        
        console.log('Actualizando cita ID:', id);
        console.log('Datos recibidos:', appointmentData);
        
        // ✅ ASEGURAR que el status no sea null
        if (!appointmentData.status) {
            appointmentData.status = 'scheduled';
        }
        
        console.log('Datos con status validado:', appointmentData);
        
        const affectedRows = await Appointment.update(id, appointmentData);
        
        if (affectedRows > 0) {
            res.json({ 
                message: 'Cita actualizada exitosamente',
                status: appointmentData.status 
            });
        } else {
            res.status(404).json({ message: 'Cita no encontrada' });
        }
    } catch (error) {
        console.error('Error actualizando cita:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.updateAppointmentNotes = async (req, res) => {
    try {
        const { id } = req.params;
        const { medical_notes, updated_at } = req.body;
        
        console.log('Actualizando notas médicas para cita:', id);
        console.log('Notas recibidas:', medical_notes);

        const [result] = await db.query(
            'UPDATE appointments SET medical_notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [medical_notes, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Cita no encontrada' });
        }

        res.json({ 
            message: 'Notas médicas actualizadas correctamente',
            medical_notes: medical_notes
        });
    } catch (error) {
        console.error('Error actualizando notas médicas:', error);
        res.status(500).json({ message: error.message });
    }
};

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

exports.cancelAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, cancellation_reason, cancellation_details, cancelled_by } = req.body;

        console.log('Cancelando cita:', id, 'datos:', req.body);

        // Verificar que la cita existe
        const [existingAppointment] = await db.query(
            'SELECT id FROM appointments WHERE id = ?', 
            [id]
        );

        if (existingAppointment.length === 0) {
            return res.status(404).json({ message: 'Cita no encontrada' });
        }

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
            return res.status(500).json({ message: 'No se pudo actualizar la cita' });
        }

        res.json({ 
            message: 'Cita cancelada correctamente',
            appointmentId: id,
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
        const { id } = req.params;
        console.log('Eliminando cita con ID:', id);
        
        const affectedRows = await Appointment.delete(id);
        
        if (affectedRows > 0) {
            res.json({ 
                message: 'Cita eliminada exitosamente',
                deletedId: id 
            });
        } else {
            res.status(404).json({ message: 'Cita no encontrada' });
        }
    } catch (error) {
        console.error('Error eliminando cita:', error);
        res.status(500).json({ message: error.message });
    }
};