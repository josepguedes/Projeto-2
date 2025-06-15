const express = require('express');
const router = express.Router();
const autenticarJWT = require('../middleware/jwtAuth');

// include controller functions
const anunciosController = require('../controllers/anuncios.controllers.js');
const { upload } = require('../config/cloudinaryConfig');

// Rotas básicas CRUD
router.get('/', anunciosController.getAllAnuncios);
router.get('/utilizador/:userId', anunciosController.getAnunciosByUser); // Changed to match controller function name
router.get('/:id', anunciosController.getAnuncioById);
router.post('/', autenticarJWT, upload.single('ImagemAnuncio'), anunciosController.createAnuncio);
router.put('/:id',autenticarJWT ,upload.single('ImagemAnuncio'), anunciosController.updateAnuncio);
router.delete('/:id', autenticarJWT,anunciosController.deleteAnuncio);
router.get('/categoria/:categoryId', anunciosController.getAnunciosByCategory);
router.get('/reservas/:userId', autenticarJWT,anunciosController.getReservasByUser);
router.post('/:id/confirmarCodigo',anunciosController.confirmarCodigoEntrega);

module.exports = router;