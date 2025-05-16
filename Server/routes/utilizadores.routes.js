const express = require('express');
const router = express.Router();

// Importa os controladores de utilizador
const utilizadoresController = require('../controllers/utilizadores.controllers.js');

// Rota para registar novo utilizador
router.post('/register', utilizadoresController.createUser);

// Rota para login de utilizador
router.post('/login', utilizadoresController.loginUser);

//Rota para editar utilizador
router.put('/:id', utilizadoresController.updateUser);

// Listar todos os utilizadores
router.get('/', utilizadoresController.getAllUsers);

// Rota para obter detalhes do utilizador
router.get('/:id', utilizadoresController.getUserDetails);

module.exports = router;