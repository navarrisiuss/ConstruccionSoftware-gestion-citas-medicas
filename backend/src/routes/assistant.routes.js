const express = require('express');
const router = express.Router();
const assistantController = require('../controllers/assistant.controller');

router.get('/', assistantController.getAllAssistants);
router.get('/email', assistantController.getAssistantByEmail);
router.post('/', assistantController.createAssistant);
router.put('/:id', assistantController.updateAssistant);
router.delete('/:id', assistantController.deleteAssistant);

module.exports = router;