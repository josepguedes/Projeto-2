const express = require('express');
const router = express.Router();

// include controller functions
const avaliacoesController = require('../controllers/avaliaçoes.controller');

// Rotas básicas CRUD
router.get('/', avaliacoesController.getAllAvaliacoes);
router.post('/', avaliacoesController.createAvaliacao);
router.delete('/:id', avaliacoesController.deleteAvaliacao);
router.put('/:id', avaliacoesController.updateAvaliacao);


module.exports = router;