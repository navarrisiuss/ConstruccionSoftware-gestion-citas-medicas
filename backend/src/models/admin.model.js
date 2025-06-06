const db = require('../config/db.config');

const Admin = {
    getAll: async () => {
        const [rows] = await db.query('SELECT * FROM administrators');
        return rows;
    },
    
    getByEmail: async (email) => {
        const [rows] = await db.query('SELECT * FROM administrators WHERE email = ?', [email]);
        return rows;
    },
    
    create: async (admin) => {
        try {
            const [result] = await db.query(
                'INSERT INTO administrators (name, paternalLastName, maternalLastName, email, password) VALUES (?, ?, ?, ?, ?)',
                [admin.name, admin.paternalLastName, admin.maternalLastName, admin.email, admin.password]
            );
            return result.insertId;
        } catch (dbError) {
            console.error('ERROR DE BASE DE DATOS:', dbError);
            throw dbError;
        }
    },

    update: async (id, admin) => {
        try {
            const [result] = await db.query(
                'UPDATE administrators SET name = ?, paternalLastName = ?, maternalLastName = ?, email = ? WHERE id = ?',
                [admin.name, admin.paternalLastName, admin.maternalLastName, admin.email, id]
            );
            return result.affectedRows;
        } catch (dbError) {
            console.error('ERROR AL ACTUALIZAR ADMIN:', dbError);
            throw dbError;
        }
    },

    delete: async (id) => {
        try {
            const [result] = await db.query('DELETE FROM administrators WHERE id = ?', [id]);
            return result.affectedRows;
        } catch (dbError) {
            console.error('ERROR AL ELIMINAR ADMIN:', dbError);
            throw dbError;
        }
    }
};

module.exports = Admin;