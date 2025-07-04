const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointment.controller');

router.get('/', appointmentController.getAllAppointments);
router.get('/patient/:patientId', appointmentController.getAppointmentsByPatient);
router.get('/physician/:physicianId', appointmentController.getAppointmentsByPhysician);
router.post('/', appointmentController.createAppointment);
router.put('/:id', appointmentController.updateAppointment);
router.put('/:id/status', appointmentController.updateAppointmentStatus); // ✅ Ruta correcta
router.put('/:id/cancel', appointmentController.cancelAppointment);
router.delete('/:id', appointmentController.deleteAppointment);
module.exports = router;