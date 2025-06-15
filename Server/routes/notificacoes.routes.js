const express = require('express');
const router = express.Router();
const notificacoesController = require('../controllers/notificacoes.controller');
const autenticarJWT = require('../middleware/jwtAuth');

// Rotas básicas CRUD
router.get('/',notificacoesController.getAllNotificacoes);
router.post('/', notificacoesController.createNotificacao);
router.delete('/:id', notificacoesController.deleteNotificacao);
router.put('/:id', notificacoesController.updateNotificacao);
router.get('/user/by-recipient-id', notificacoesController.getNotificacoesByUserId);
router.post('/associar', notificacoesController.associarNotificacaoAUtilizador);

module.exports = router;