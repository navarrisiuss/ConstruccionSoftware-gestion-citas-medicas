const db = require("../config/db.config");

const Physician = {
  getAll: async () => {
    const [rows] = await db.query("SELECT * FROM physicians");
    return rows;
  },

  getByEmail: async (email) => {
    const [rows] = await db.query("SELECT * FROM physicians WHERE email = ?", [
      email,
    ]);
    return rows;
  },

  getById: async (id) => {
    const [rows] = await db.execute("SELECT * FROM physicians WHERE id = ?", [
      id,
    ]);
    return rows[0]; // Si esperas un único médico
  },

  getBySpecialty: async (specialty) => {
    const [rows] = await db.query(
      "SELECT * FROM physicians WHERE specialty = ?",
      [specialty]
    );
    return rows;
  },

  create: async (physician) => {
    const [result] = await db.query(
      "INSERT INTO physicians (name, paternalLastName, maternalLastName, email, password, specialty, license_number, phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        physician.name,
        physician.paternalLastName,
        physician.maternalLastName,
        physician.email,
        physician.password,
        physician.specialty,
        physician.license_number,
        physician.phone,
      ]
    );
    return result.insertId;
  },

  update: async (id, physician) => {
    const [result] = await db.query(
      "UPDATE physicians SET name = ?, paternalLastName = ?, maternalLastName = ?, email = ?, specialty = ?, license_number = ?, phone = ? WHERE id = ?",
      [
        physician.name,
        physician.paternalLastName,
        physician.maternalLastName,
        physician.email,
        physician.specialty,
        physician.license_number,
        physician.phone,
        id,
      ]
    );
    return result.affectedRows > 0;
  },

  delete: async (id) => {
    const [result] = await db.query("DELETE FROM physicians WHERE id = ?", [
      id,
    ]);
    return result.affectedRows > 0;
  },
};

module.exports = Physician;
