const express = require('express');
const router = express.Router();

// include controller functions
const denunciasController = require('../controllers/denuncias.controllers.js');

// Rotas básicas CRUD
router.get('/', denunciasController.getAllDenuncias);
router.post('/', denunciasController.createDenuncia);
router.delete('/:id', denunciasController.deleteDenuncia);

module.exports = router;