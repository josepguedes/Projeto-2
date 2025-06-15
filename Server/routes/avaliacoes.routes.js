const express = require('express');
const router = express.Router();
const autenticarJWT = require('../middleware/auth');

// include controller functions
const avaliacoesController = require('../controllers/avaliaçoes.controller');

// Rotas básicas CRUD
router.get('/', avaliacoesController.getAllAvaliacoes);
router.post('/', avaliacoesController.createAvaliacao, autenticarJWT);
router.delete('/:id', avaliacoesController.deleteAvaliacao, autenticarJWT);
router.put('/:id', avaliacoesController.updateAvaliacao,  autenticarJWT);


module.exports = router;