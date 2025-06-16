const express = require('express');
const router = express.Router();
const notificacoesController = require('../controllers/notificacoes.controller');
const autenticarJWT = require('../middleware/jwtAuth');

// Rotas básicas CRUD
router.get('/', autenticarJWT, notificacoesController.getAllNotificacoes);
router.post('/', autenticarJWT, notificacoesController.createNotificacao);
router.delete('/:id', (req, res, next) => autenticarJWT(req, res, next, true), notificacoesController.deleteNotificacao);
router.put('/:id', autenticarJWT, notificacoesController.updateNotificacao);
router.get('/user/by-recipient-id', autenticarJWT, notificacoesController.getNotificacoesByUserId);
router.post('/associar', autenticarJWT, notificacoesController.associarNotificacaoAUtilizador);

module.exports = router;