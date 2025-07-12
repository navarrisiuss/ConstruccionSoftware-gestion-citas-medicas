const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');

// Generar reportes
router.post('/appointments', reportController.generateAppointmentsReport);
router.post('/physicians', reportController.generatePhysiciansReport);
router.post('/patients', reportController.generatePatientsReport);

// Guardar y gestionar reportes
router.post('/save', reportController.saveReport);
router.get('/history', reportController.getReportHistory);
router.get('/statistics', reportController.getGeneralStatistics);

module.exports = router;