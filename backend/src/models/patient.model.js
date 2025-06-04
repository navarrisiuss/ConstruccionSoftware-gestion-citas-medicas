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
  
  create: async (patient) => {
    try {
      // Formatear la fecha correctamente
      let birthDate = patient.birthDate;
      if (birthDate && birthDate.includes('T')) {
        // Si tiene formato ISO, extraer solo la parte de la fecha
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
  }
};

module.exports = Patient;