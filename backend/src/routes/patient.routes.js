const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patient.controller');

router.get('/', patientController.getAllPatients);
router.get('/email', patientController.getPatientByEmail);
router.get('/check-rut', patientController.checkRutExists); // Nueva ruta
router.get('/search', patientController.searchPatientByEmail); // Ruta para obtener pacientes por correo electrónico
router.post('/', patientController.createPatient);
router.put('/:id', patientController.updatePatient); // Nueva ruta

module.exports = router;