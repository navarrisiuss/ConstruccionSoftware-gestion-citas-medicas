const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patient.controller');

// Rutas existentes
router.get('/', patientController.getAllPatients);
router.get('/check-rut', patientController.checkRutExists);
router.get('/check-email', patientController.getPatientByEmail);
router.get('/search', patientController.searchPatientByEmail);
router.get('/:id', patientController.getPatientById);
router.post('/', patientController.createPatient);
router.put('/:id', patientController.updatePatient);

// ✅ NUEVAS RUTAS
router.patch('/:id/deactivate', patientController.deactivatePatient);  // Desactivar
router.patch('/:id/reactivate', patientController.reactivatePatient);  // Reactivar
router.delete('/:id', patientController.deletePatient);                // Eliminación permanente

module.exports = router;