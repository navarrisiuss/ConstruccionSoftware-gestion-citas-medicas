const express = require('express');
const router = express.Router();
const physicianController = require('../controllers/physician.controller');

router.get('/', physicianController.getAllPhysicians);
router.get('/email', physicianController.getPhysicianByEmail);
router.get('/specialty', physicianController.getPhysiciansBySpecialty); // Nueva ruta para obtener médicos por especialidad
router.post('/', physicianController.createPhysician);
router.put('/:id', physicianController.updatePhysician); // Nueva ruta para actualización
router.delete('/:id', physicianController.deletePhysician);

module.exports = router;