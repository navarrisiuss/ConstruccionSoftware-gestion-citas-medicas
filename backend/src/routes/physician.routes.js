const express = require('express');
const router = express.Router();
const physicianController = require('../controllers/physician.controller');

router.get('/', physicianController.getAllPhysicians);
router.get('/email', physicianController.getPhysicianByEmail);
router.post('/', physicianController.createPhysician);

module.exports = router;