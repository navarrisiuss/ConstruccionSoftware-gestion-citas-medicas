const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

// Importar rutas
const patientRoutes = require('./routes/patient.routes');
const physicianRoutes = require('./routes/physician.routes');
const assistantRoutes = require('./routes/assistant.routes');
const adminRoutes = require('./routes/admin.routes');
const appointmentRoutes = require('./routes/appointment.routes');
const authRoutes = require('./routes/auth.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Test de base de datos
app.get('/test-db', async (req, res) => {
    try {
        const db = require('./config/db.config');
        const [rows] = await db.query('SELECT 1 as test');
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('ERROR DE CONEXIÓN DB:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Rutas
app.use('/api/patients', patientRoutes);
app.use('/api/physicians', physicianRoutes);
app.use('/api/assistants', assistantRoutes);
app.use('/api/admins', adminRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/auth', authRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
    res.json({ message: 'API de Gestión de Citas Médicas funcionando correctamente' });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});