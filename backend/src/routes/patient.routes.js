const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patient.controller');

router.get('/', patientController.getAllPatients);
router.get('/email', patientController.getPatientByEmail);
router.post('/', patientController.createPatient);

module.exports = router;