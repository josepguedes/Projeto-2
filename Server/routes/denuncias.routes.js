const express = require('express');
const router = express.Router();
const autenticarJWT = require('../middleware/jwtAuth');

// include controller functions
const denunciasController = require('../controllers/denuncias.controllers.js');

// Rotas básicas CRUD
router.get('/', autenticarJWT, denunciasController.getAllDenuncias);
router.post('/', autenticarJWT, denunciasController.createDenuncia);
router.delete('/:id', (req, res, next) => autenticarJWT(req, res, next, true), denunciasController.deleteDenuncia);

module.exports = router;