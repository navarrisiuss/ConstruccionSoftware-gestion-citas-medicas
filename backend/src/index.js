const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'Cargada' : 'No cargada');

// Importar la librería de Google Gemini
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Importar rutas existentes
const patientRoutes = require('./routes/patient.routes');
const physicianRoutes = require('./routes/physician.routes');
const assistantRoutes = require('./routes/assistant.routes');
const adminRoutes = require('./routes/admin.routes');
const appointmentRoutes = require('./routes/appointment.routes');
const authRoutes = require('./routes/auth.routes');
const reportRoutes = require('./routes/report.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// --- Configuración de Gemini ---
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
    console.error('ERROR: La variable de entorno GEMINI_API_KEY no está definida.');
    //process.exit(1); // Salir de la aplicación si no hay clave
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
// --- Fin Configuración de Gemini ---

// Test de base de datos
app.get('/test-db', async (req, res) => {
    try {
        const db = require('./config/db.config'); // Asegúrate de que esta ruta sea correcta
        const [rows] = await db.query('SELECT 1 as test');
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('ERROR DE CONEXIÓN DB:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// --- Nueva Ruta para el Chat de Ayuda con Gemini ---
app.post('/api/chat/gemini', async (req, res) => {
    const userQuestion = req.body.question;

    if (!userQuestion) {
        return res.status(400).json({ error: 'La pregunta es requerida.' });
    }

    // --- Ingeniería de Prompt para tu Asistente de Citas Médicas ---
    // Adapta este prompt para que sea específico de tu sistema.
    const fullPrompt = `
        Eres un asistente de ayuda para un sistema de gestión de citas médicas llamado Clínica Aurix.
        Tu propósito es responder preguntas relacionadas con el agendamiento, modificación y consulta de citas,
        así como información general sobre el funcionamiento del sistema para pacientes, médicos y personal administrativo.

        Información clave sobre Clínica Aurix:
        - Los pacientes pueden registrarse, buscar médicos por especialidad, ver su disponibilidad y agendar citas.
        - Los administradores pueden gestionar usuarios, médicos y citas, así como ver estadísticas.
        - Los médicos pueden gestionar su disponibilidad, ver sus citas y actualizar su perfil.
        - Los asistentes pueden crear y gestionar citas en nombre de los pacientes, y ayudar con la administración.
        - Para agendar una cita, un paciente debe iniciar sesión, ir a la sección "Agendar Cita", seleccionar un médico, una fecha y una hora disponibles.
        - Para cancelar o reagendar una cita, el usuario debe ir a "Mis Citas" y usar las opciones correspondientes.
        - Las especialidades médicas disponibles son: Cardiologia, Dermatologia, Endocrinologia, Gastroenterologia, Ginecologia, Neurologia, Oftalmologia,Ortopedia, Pediatria, Psiquiatria, Radiologia, Urologia, Medicina General, Traumatologia, Oncologia, Otorrinolaringologia
        - El horario de atención es de Lunes a Viernes, de 9:00 AM a 6:00 PM.

        Si la pregunta del usuario es compleja o requiere información específica de la base de datos (ej: "qué citas tengo el martes"),
        o si no puedes responder con la información proporcionada, indica que no tienes acceso a esa información en tiempo real
        y sugiere al usuario iniciar sesión o contactar con el soporte.
        Si la pregunta no está relacionada con el sistema de gestión de citas médicas,
        por favor, responde amablemente que tu función es ayudar con el sistema "MediConnect".

        Pregunta del usuario: ${userQuestion}
    `;
    // --- Fin de Ingeniería de Prompt ---

    try {
        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        const text = response.text();
        res.json({ reply: text });
    } catch (error) {
        console.error('Error al comunicarse con Gemini:', error);
        // Podrías devolver un mensaje más amigable o detallado según el error
        res.status(500).json({ error: 'Hubo un problema al procesar tu solicitud con la IA.' });
    }
});
// --- Fin Nueva Ruta para el Chat de Ayuda ---


// Rutas existentes
app.use('/api/patients', patientRoutes);
app.use('/api/physicians', physicianRoutes);
app.use('/api/assistants', assistantRoutes);
app.use('/api/admins', adminRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
    res.json({ message: 'API de Gestión de Citas Médicas funcionando correctamente' });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});