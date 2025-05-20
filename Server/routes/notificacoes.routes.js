const express = require('express');
const router = express.Router();
const notificacoesController = require('../controllers/notificacoes.controller');

router.get('/', notificacoesController.getAllNotificacoes);

module.exports = router;