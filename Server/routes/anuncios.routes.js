const express = require('express');
const router = express.Router();

// include controller functions
const anunciosController = require('../controllers/anuncios.controllers.js');

// Rotas básicas CRUD
router.get('/', anunciosController.getAllAnuncios);
router.get('/:id', anunciosController.getAnuncioById);
router.post('/', anunciosController.createAnuncio);
router.put('/:id', anunciosController.updateAnuncio);
router.delete('/:id', anunciosController.deleteAnuncio);

module.exports = router;