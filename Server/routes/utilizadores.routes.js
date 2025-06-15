const express = require('express');
const router = express.Router();
const { upload } = require('../config/cloudinaryConfig');
const utilizadoresController = require('../controllers/utilizadores.controllers');
const autenticarJWT = require('../middleware/jwtAuth');


// Rota para registar novo utilizador
router.post('/', upload.single('ImagemPerfil'), utilizadoresController.createUser);

// Rota para login de utilizador
router.post('/login', utilizadoresController.loginUser);

//Rota para editar utilizador
router.put('/:id', autenticarJWT,upload.single('ImagemPerfil'), utilizadoresController.updateUser);

// Listar todos os utilizadores
router.get('/', utilizadoresController.getAllUsers);

// Rota para obter detalhes do utilizador
router.get('/:id', autenticarJWT,utilizadoresController.getUserDetails);

module.exports = router;