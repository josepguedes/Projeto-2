const express = require('express');
const router = express.Router();
const notificacoesController = require('../controllers/notificacoes.controller');
const autenticarJWT = require('../middleware/jwtAuth');

// Rotas básicas CRUD
router.get('/', autenticarJWT, notificacoesController.getAllNotificacoes);
router.post('/', (req, res, next) => autenticarJWT(req, res, next, true), notificacoesController.createNotificacao);
router.delete('/:id', (req, res, next) => autenticarJWT(req, res, next, true), notificacoesController.deleteNotificacao);
router.put('/:id', autenticarJWT, notificacoesController.updateNotificacao);
router.get('/user/by-recipient-id', autenticarJWT, notificacoesController.getNotificacoesByUserId);
router.post('/associar', autenticarJWT, notificacoesController.associarNotificacaoAUtilizador);
router.put('/marcar-todas-lidas', autenticarJWT, notificacoesController.marcarTodasComoLidas);

module.exports = router;