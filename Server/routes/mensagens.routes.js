const express = require('express');
const router = express.Router();
const mensagensController = require('../controllers/mensagens.controllers.js');

// Get chat messages
router.get('/', mensagensController.getMensagensChat);

// Send message
router.post('/', mensagensController.createMensagem);

// Delete message
router.delete('/:id', mensagensController.deleteMensagem);

module.exports = router;