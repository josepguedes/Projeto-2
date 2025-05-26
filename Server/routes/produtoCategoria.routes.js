const express = require('express');
const router = express.Router();
const produtoCategoriaController = require('../controllers/produtoCategoria.controller');

// Rotas básicas CRUD
router.get('/', produtoCategoriaController.getAllCategorias);
router.post('/', produtoCategoriaController.createCategoria);
router.delete('/:id', produtoCategoriaController.deleteCategoria);

module.exports = router;