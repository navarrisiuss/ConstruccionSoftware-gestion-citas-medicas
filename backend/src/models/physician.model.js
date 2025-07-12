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

  getById: async (id) => {
    const [rows] = await db.execute('SELECT * FROM physicians WHERE id = ?', [id]);
    return rows[0]; // Si esperas un único médico
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