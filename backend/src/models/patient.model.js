const db = require('../config/db.config');

const Patient = {
    getAll: async () => {
        const [rows] = await db.query('SELECT * FROM patients');
        return rows;
    },

    getByEmail: async (email) => {
        const [rows] = await db.query('SELECT * FROM patients WHERE email = ?', [email]);
        return rows;
    },

    // Nuevo método para buscar por RUT
    getByRut: async (rut) => {
        const [rows] = await db.query('SELECT * FROM patients WHERE rut = ?', [rut]);
        return rows;
    },

    // Método para obtener paciente por ID
    getById: async (id) => {
        const [rows] = await db.query('SELECT * FROM patients WHERE id = ?', [id]);
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
                'INSERT INTO patients (name, paternalLastName, maternalLastName, email, password, rut, birthDate, phone, address, gender) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [patient.name, patient.paternalLastName, patient.maternalLastName, patient.email, patient.password, patient.rut, birthDate, patient.phone, patient.address, patient.gender]
            );
            return result.insertId;
        } catch (dbError) {
            console.error('ERROR DE BASE DE DATOS:', dbError);
            throw dbError;
        }
    },

    // Nuevo método para actualizar paciente
    update: async (id, patient) => {
        try {
            let birthDate = patient.birthDate;
            if (birthDate && birthDate.includes('T')) {
                birthDate = birthDate.split('T')[0];
            }

            const [result] = await db.query(
                'UPDATE patients SET name = ?, paternalLastName = ?, maternalLastName = ?, email = ?, password = ?, birthDate = ?, phone = ?, address = ?, gender = ? WHERE id = ?',
                [patient.name, patient.paternalLastName, patient.maternalLastName, patient.email, patient.password, birthDate, patient.phone, patient.address, patient.gender, id]
            );
            return result.affectedRows;
        } catch (dbError) {
            console.error('ERROR AL ACTUALIZAR PACIENTE:', dbError);
            throw dbError;
        }
    }
};

module.exports = Patient;