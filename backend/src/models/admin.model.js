const db = require('../config/db.config');

const Admin = {
    getAll: async () => {
        const [rows] = await db.query('SELECT * FROM administrators');
        if (rows.length === 0) {
            throw new Error('No se encontraron administradores');
        }
        return rows;
    },
    
    getByEmail: async (email) => {
        const [rows] = await db.query('SELECT * FROM admins WHERE email = ?', [email]);
        
        return rows;
    },
    
    create: async (admin) => {
        try {
        // Formatear la fecha correctamente
        let birthDate = admin.birthDate;
        if (birthDate && birthDate.includes('T')) {
            // Si tiene formato ISO, extraer solo la parte de la fecha
            birthDate = birthDate.split('T')[0];
        }
        console.log('Fecha formateada:', birthDate);
        
        const [result] = await db.query(
            'INSERT INTO admins (name, email, password) VALUES (?, ?, ?)',
            [admin.name, admin.email, admin.password]
        );
        return result.insertId;
        } catch (dbError) {
        console.error('ERROR DE BASE DE DATOS:', dbError);
        throw dbError;
        }
    }
    };