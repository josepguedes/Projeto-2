const express = require('express');
const router = express.Router();
const mensagensController = require('../controllers/mensagens.controllers.js');
const autenticarJWT = require('../middleware/jwtAuth');

// Get chat messages
router.get('/',  autenticarJWT,mensagensController.getMensagensChat);

// Send message
router.post('/', autenticarJWT,mensagensController.createMensagem);

// Delete message
router.delete('/:id', autenticarJWT,mensagensController.deleteMensagem);

router.get('/conversations/:userId', autenticarJWT,mensagensController.getUserConversations);

module.exports = router;