const db = require('../config/db.config');

const Appointment = {
    getAll: async () => {
        const [rows] = await db.query(`
            SELECT a.*, p.name as patient_name, ph.name as physician_name, ph.specialty 
            FROM appointments a 
            JOIN patients p ON a.patient_id = p.id 
            JOIN physicians ph ON a.physician_id = ph.id
        `);
        return rows;
    },
    
    getByPatientId: async (patientId) => {
        const [rows] = await db.query(`
            SELECT a.*, ph.name as physician_name, ph.specialty 
            FROM appointments a 
            JOIN physicians ph ON a.physician_id = ph.id 
            WHERE a.patient_id = ?
        `, [patientId]);
        return rows;
    },

    getByPhysicianId: async (physicianId) => {
        const [rows] = await db.query(`
            SELECT a.*, p.name as patient_name 
            FROM appointments a 
            JOIN patients p ON a.patient_id = p.id 
            WHERE a.physician_id = ?
        `, [physicianId]);
        return rows;
    },
    
    create: async (appointment) => {
        try {
            console.log('📝 Creando cita con datos:', appointment);
            console.log('📋 preparation_notes recibido:', appointment.preparation_notes);
            const [result] = await db.query(
                `INSERT INTO appointments 
                 (patient_id, physician_id, date, time, reason, status, priority, notes, medical_notes, preparation_notes, created_at) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
                [
                    appointment.patient_id, 
                    appointment.physician_id, 
                    appointment.date, 
                    appointment.time, 
                    appointment.reason || '', 
                    appointment.status || 'scheduled',
                    appointment.priority || 'normal',
                    appointment.notes || '',
                    appointment.medical_notes || '',
                    appointment.preparation_notes || '', // ✅ AGREGADO
                ]
            );
            console.log('✅ Cita creada con ID:', result.insertId);
            return result.insertId;
        } catch (dbError) {
            console.error('ERROR DE BASE DE DATOS:', dbError);
            throw dbError;
        }
    },

    update: async (id, appointment) => {
        try {
            const [result] = await db.query(
                `UPDATE appointments 
                 SET patient_id = ?, 
                     physician_id = ?, 
                     date = ?, 
                     time = ?, 
                     reason = ?, 
                     status = ?, 
                     priority = ?, 
                     notes = ?,
                     medical_notes = ?,
                     preparation_notes = ?, -- ✅ AGREGADO
                     updated_at = NOW() 
                 WHERE id = ?`,
                [
                    appointment.patient_id, 
                    appointment.physician_id, 
                    appointment.date, 
                    appointment.time, 
                    appointment.reason || '', 
                    appointment.status || 'scheduled',
                    appointment.priority || 'normal',
                    appointment.notes || '',
                    appointment.medical_notes || '',
                    appointment.preparation_notes || '', // ✅ AGREGADO
                    id
                ]
            );
            return result.affectedRows;
        } catch (dbError) {
            console.error('ERROR AL ACTUALIZAR CITA:', dbError);
            throw dbError;
        }
    },

    delete: async (id) => {
        try {
            const [result] = await db.query('DELETE FROM appointments WHERE id = ?', [id]);
            return result.affectedRows;
        } catch (dbError) {
            console.error('ERROR AL ELIMINAR CITA:', dbError);
            throw dbError;
        }
    }
};

module.exports = Appointment;