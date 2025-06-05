const express = require('express');
const router = express.Router();

// include controller functions
const anunciosController = require('../controllers/anuncios.controllers.js');
const { upload } = require('../config/cloudinaryConfig');

// Rotas básicas CRUD
router.get('/', anunciosController.getAllAnuncios);
router.get('/utilizador/:userId', anunciosController.getAnunciosByUser); // Changed to match controller function name
router.get('/:id', anunciosController.getAnuncioById);
router.post('/', upload.single('ImagemAnuncio'), anunciosController.createAnuncio);
router.put('/:id', upload.single('ImagemAnuncio'), anunciosController.updateAnuncio);
router.delete('/:id', anunciosController.deleteAnuncio);
router.get('/categoria/:categoryId', anunciosController.getAnunciosByCategory);

module.exports = router;