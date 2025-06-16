const express = require('express');
const router = express.Router();
const produtoCategoriaController = require('../controllers/produtoCategoria.controller');
const autenticarJWT = require('../middleware/jwtAuth');

// Rotas básicas CRUD
router.get('/', produtoCategoriaController.getAllCategorias);
router.post('/', (req, res, next) => autenticarJWT(req, res, next, true), produtoCategoriaController.createCategoria);
router.delete('/:id', (req, res, next) => autenticarJWT(req, res, next, true), produtoCategoriaController.deleteCategoria);

module.exports = router;