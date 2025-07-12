const db = require('../config/db.config');

const Patient = {
    // ✅ ACTUALIZAR: Solo obtener pacientes activos por defecto
    getAll: async (includeInactive = false) => {
        const query = includeInactive 
            ? 'SELECT * FROM patients ORDER BY active DESC, name ASC'
            : 'SELECT * FROM patients WHERE active = 1 ORDER BY name ASC';
        const [rows] = await db.query(query);
        return rows;
    },

    getByEmail: async (email) => {
        const [rows] = await db.query(
            'SELECT * FROM patients WHERE email = ? AND active = 1', 
            [email]
        );
        return rows;
    },

    // ✅ ACTUALIZAR: Solo buscar pacientes activos
    getByRut: async (rut) => {
        const [rows] = await db.query(
            'SELECT * FROM patients WHERE rut = ? AND active = 1', 
            [rut]
        );
        return rows;
    },

    // ✅ ACTUALIZAR: Permitir obtener pacientes inactivos para administración
    getByRutIncludeInactive: async (rut) => {
        const [rows] = await db.query('SELECT * FROM patients WHERE rut = ?', [rut]);
        return rows;
    },

    getById: async (id, includeInactive = false) => {
        const query = includeInactive
            ? 'SELECT * FROM patients WHERE id = ?'
            : 'SELECT * FROM patients WHERE id = ? AND active = 1';
        const [rows] = await db.query(query, [id]);
        return rows;
    },

    create: async (patient) => {
        try {
            let birthDate = patient.birthDate;
            if (birthDate && birthDate.includes('T')) {
                birthDate = birthDate.split('T')[0];
            }

            console.log('Fecha formateada:', birthDate);

            const [result] = await db.query(
                'INSERT INTO patients (name, paternalLastName, maternalLastName, email, password, rut, birthDate, phone, address, gender, active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)',
                [patient.name, patient.paternalLastName, patient.maternalLastName, patient.email, patient.password, patient.rut, birthDate, patient.phone, patient.address, patient.gender]
            );
            return result.insertId;
        } catch (dbError) {
            console.error('ERROR DE BASE DE DATOS:', dbError);
            throw dbError;
        }
    },

    update: async (id, patient) => {
        try {
            let birthDate = patient.birthDate;
            if (birthDate && birthDate.includes('T')) {
                birthDate = birthDate.split('T')[0];
            }

            // ✅ MANTENER el estado active si no se especifica
            const query = patient.active !== undefined
                ? 'UPDATE patients SET name = ?, paternalLastName = ?, maternalLastName = ?, email = ?, password = ?, birthDate = ?, phone = ?, address = ?, gender = ?, active = ? WHERE id = ?'
                : 'UPDATE patients SET name = ?, paternalLastName = ?, maternalLastName = ?, email = ?, password = ?, birthDate = ?, phone = ?, address = ?, gender = ? WHERE id = ?';

            const params = patient.active !== undefined
                ? [patient.name, patient.paternalLastName, patient.maternalLastName, patient.email, patient.password, birthDate, patient.phone, patient.address, patient.gender, patient.active, id]
                : [patient.name, patient.paternalLastName, patient.maternalLastName, patient.email, patient.password, birthDate, patient.phone, patient.address, patient.gender, id];

            const [result] = await db.query(query, params);
            return result.affectedRows;
        } catch (dbError) {
            console.error('ERROR AL ACTUALIZAR PACIENTE:', dbError);
            throw dbError;
        }
    },

    // ✅ CORREGIR: Desactivar paciente (soft delete) - SIN deactivated_at
    deactivate: async (id) => {
        try {
            const [result] = await db.query(
                'UPDATE patients SET active = 0 WHERE id = ?', 
                [id]
            );
            return result.affectedRows;
        } catch (dbError) {
            console.error('ERROR AL DESACTIVAR PACIENTE:', dbError);
            throw dbError;
        }
    },

    // ✅ CORREGIR: Reactivar paciente - SIN deactivated_at
    reactivate: async (id) => {
        try {
            const [result] = await db.query(
                'UPDATE patients SET active = 1 WHERE id = ?', 
                [id]
            );
            return result.affectedRows;
        } catch (dbError) {
            console.error('ERROR AL REACTIVAR PACIENTE:', dbError);
            throw dbError;
        }
    },

    // ✅ MANTENER para casos extremos (solo administradores)
    delete: async (id) => {
        try {
            const [result] = await db.query('DELETE FROM patients WHERE id = ?', [id]);
            return result.affectedRows;
        } catch (dbError) {
            console.error('ERROR AL ELIMINAR PACIENTE:', dbError);
            throw dbError;
        }
    }
};

module.exports = Patient;