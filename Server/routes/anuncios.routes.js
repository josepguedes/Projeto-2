const express = require('express');
const router = express.Router();

// include controller functions
const anunciosController = require('../controllers/anuncios.controllers.js');

// Rotas básicas CRUD
router.get('/', anunciosController.getAllAnuncios);
router.post('/', anunciosController.createAnuncio);
router.put('/:id', anunciosController.updateAnuncio);
router.delete('/:id', anunciosController.deleteAnuncio);

router.get('/:id', anunciosController.getAnuncioById);

module.exports = router;