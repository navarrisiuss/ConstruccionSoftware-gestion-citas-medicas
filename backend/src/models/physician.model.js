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
    try {
      const [result] = await db.query(
        'INSERT INTO physicians (name, paternalLastName, maternalLastName, email, password, specialty) VALUES (?, ?, ?, ?, ?, ?)',
        [physician.name, physician.paternalLastName, physician.maternalLastName, physician.email, physician.password, physician.specialty]
      );
      return result.insertId;
    } catch (dbError) {
      console.error('ERROR AL CREAR MÉDICO:', dbError);
      throw dbError;
    }
  },

  // Nuevo método para actualizar médico
  update: async (id, physician) => {
    try {
      let query = 'UPDATE physicians SET name = ?, paternalLastName = ?, maternalLastName = ?, email = ?, specialty = ?';
      let params = [physician.name, physician.paternalLastName, physician.maternalLastName, physician.email, physician.specialty];
      
      // Si se proporciona contraseña, incluirla en la actualización
      if (physician.password) {
        query += ', password = ?';
        params.push(physician.password);
      }
      
      query += ' WHERE id = ?';
      params.push(id);

      const [result] = await db.query(query, params);
      return result.affectedRows;
    } catch (dbError) {
      console.error('ERROR AL ACTUALIZAR MÉDICO:', dbError);
      throw dbError;
    }
  }
};

module.exports = Physician;