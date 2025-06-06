const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();


const patientRoutes = require('./routes/patient.routes');
const physicianRoutes = require('./routes/physician.routes');
const authRoutes = require('./routes/auth.routes');

const app = express();
const PORT = process.env.PORT || 3000;


app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

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


app.use('/api/patients', patientRoutes);
app.use('/api/physicians', physicianRoutes);
app.use('/api/auth', authRoutes);


app.get('/', (req, res) => {
  res.json({ message: 'API de Gestión de Citas Médicas funcionando correctamente' });
});


app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});