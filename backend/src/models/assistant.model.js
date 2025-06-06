const db = require('../config/db.config');

const Assistant = {
    getAll: async () => {
        const [rows] = await db.query('SELECT * FROM assistants');
        return rows;
    },
    
    getByEmail: async (email) => {
        const [rows] = await db.query('SELECT * FROM assistants WHERE email = ?', [email]);
        return rows;
    },
    
    create: async (assistant) => {
        try {
            const [result] = await db.query(
                'INSERT INTO assistants (name, paternalLastName, maternalLastName, email, password) VALUES (?, ?, ?, ?, ?)',
                [assistant.name, assistant.paternalLastName, assistant.maternalLastName, assistant.email, assistant.password]
            );
            return result.insertId;
        } catch (dbError) {
            console.error('ERROR DE BASE DE DATOS:', dbError);
            throw dbError;
        }
    },

    update: async (id, assistant) => {
        try {
            const [result] = await db.query(
                'UPDATE assistants SET name = ?, paternalLastName = ?, maternalLastName = ?, email = ? WHERE id = ?',
                [assistant.name, assistant.paternalLastName, assistant.maternalLastName, assistant.email, id]
            );
            return result.affectedRows;
        } catch (dbError) {
            console.error('ERROR AL ACTUALIZAR ASISTENTE:', dbError);
            throw dbError;
        }
    },

    delete: async (id) => {
        try {
            const [result] = await db.query('DELETE FROM assistants WHERE id = ?', [id]);
            return result.affectedRows;
        } catch (dbError) {
            console.error('ERROR AL ELIMINAR ASISTENTE:', dbError);
            throw dbError;
        }
    }
};

module.exports = Assistant;