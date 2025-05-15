const express = require('express');
const router = express.Router();

// Importa os controladores de utilizador
const utilizadoresController = require('../controllers/utilizadores.controllers.js');

// Rota para registar novo utilizador
router.post('/register', utilizadoresController.createUser);

// Rota para login de utilizador
router.post('/login', utilizadoresController.loginUser);

module.exports = router;