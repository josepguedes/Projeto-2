const express = require('express');
const router = express.Router();
const autenticarJWT = require('../middleware/jwtAuth');

// include controller functions
const anunciosController = require('../controllers/anuncios.controllers.js');
const { upload } = require('../config/cloudinaryConfig');

// Rotas básicas CRUD
router.get('/categoria/:categoryId', anunciosController.getAnunciosByCategory);
router.get('/categoria', (req, res) => {
    res.status(400).json({ message: "ID da categoria é obrigatório" });
});
// router.get('/reservas', (req, res) => {
//     res.status(400).json({ message: "ID da reserva é obrigatório" });
// });
router.get('/reservas', (req, res, next) => autenticarJWT(req, res, next, true), anunciosController.getAllReservas);
router.get('/', anunciosController.getAllAnuncios);
router.get('/utilizador/:userId', anunciosController.getAnunciosByUser);
router.get('/:id', anunciosController.getAnuncioById);
router.post('/', autenticarJWT, upload.single('ImagemAnuncio'), anunciosController.createAnuncio);
router.put('/:id', autenticarJWT, upload.single('ImagemAnuncio'), anunciosController.updateAnuncio);
router.delete('/:id', autenticarJWT, anunciosController.deleteAnuncio);
router.get('/reservas/:userId', autenticarJWT, anunciosController.getReservasByUser);
router.post('/:id/confirmarCodigo', autenticarJWT, anunciosController.confirmarCodigoEntrega);

module.exports = router;