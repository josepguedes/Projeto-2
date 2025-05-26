const express = require('express');
const router = express.Router();
const notificacoesController = require('../controllers/notificacoes.controller');

// Rotas básicas CRUD
router.get('/', notificacoesController.getAllNotificacoes);
router.post('/', notificacoesController.createNotificacao);
router.delete('/:id', notificacoesController.deleteNotificacao);
router.put('/:id', notificacoesController.updateNotificacao);

module.exports = router;