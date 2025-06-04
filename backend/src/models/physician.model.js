const db = require('../config/db.config');

const Physician = {
  getAll: async () => {
    const [rows] = await db.query('SELECT * FROM physicians');
    return rows;
  },
  
  getByEmail: async (email) => {
    const [rows] = await db.query('SELECT * FROM physicians WHERE email = ?', [email]);
    return rows;
  },
  
  create: async (physician) => {
    const [result] = await db.query(
      'INSERT INTO physicians (name, paternalLastName, maternalLastName, email, password, specialty) VALUES (?, ?, ?, ?, ?, ?)',
      [physician.name, physician.paternalLastName, physician.maternalLastName, physician.email, physician.password, physician.specialty]
    );
    return result.insertId;
  }
};

module.exports = Physician;