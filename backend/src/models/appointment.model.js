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
            const [result] = await db.query(
                'INSERT INTO appointments (patient_id, physician_id, date, time, reason, status) VALUES (?, ?, ?, ?, ?, ?)',
                [appointment.patient_id, appointment.physician_id, appointment.date, appointment.time, appointment.reason, appointment.status || 'scheduled']
            );
            return result.insertId;
        } catch (dbError) {
            console.error('ERROR DE BASE DE DATOS:', dbError);
            throw dbError;
        }
    },
    checkConflict: async (physicianId, date, time) => {
        try {
            const [rows] = await db.query(`
                SELECT id FROM appointments 
                WHERE physician_id = ? 
                AND date = ? 
                AND time = ? 
                AND status != 'cancelled'
            `, [physicianId, date, time]);
            
            return rows.length > 0 ? rows[0] : null;
        } catch (dbError) {
            console.error('ERROR AL VERIFICAR CONFLICTO:', dbError);
            throw dbError;
        }
    },

    update: async (id, appointment) => {
        try {
            const [result] = await db.query(
                'UPDATE appointments SET date = ?, time = ?, reason = ?, status = ? WHERE id = ?',
                [appointment.date, appointment.time, appointment.reason, appointment.status, id]
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