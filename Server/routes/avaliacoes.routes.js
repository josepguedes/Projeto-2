const express = require('express');
const router = express.Router();
const autenticarJWT = require('../middleware/jwtAuth');

// include controller functions
const avaliacoesController = require('../controllers/avaliaçoes.controller');

// Rotas básicas CRUD
router.get('/', avaliacoesController.getAllAvaliacoes);
router.post('/', autenticarJWT, avaliacoesController.createAvaliacao);
router.delete('/:id',autenticarJWT , avaliacoesController.deleteAvaliacao);
router.put('/:id',autenticarJWT, avaliacoesController.updateAvaliacao);


module.exports = router;