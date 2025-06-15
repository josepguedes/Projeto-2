const express = require('express');
const router = express.Router();
const bloqueiosController = require('../controllers/bloqueios.controllers.js');

// Rotas para bloqueios entre utilizadores
router.get('/utilizador', bloqueiosController.getAllUtilizadorBloqueios);
router.get('/utilizador/check', bloqueiosController.checkUtilizadorBloqueio);
router.post('/utilizador', bloqueiosController.createUtilizadorBloqueio);
router.delete('/utilizador/:id', bloqueiosController.deleteUtilizadorBloqueio);

// Rotas para bloqueios administrativos - remova os middlewares para testes
router.get('/admin', bloqueiosController.getAllAdminBloqueios); 
router.get('/admin/:id', bloqueiosController.getAdminBloqueioById);
router.post('/admin', bloqueiosController.createAdminBloqueio);
router.delete('/admin/:id', bloqueiosController.deleteAdminBloqueio);
router.get('/admin/check/:id', bloqueiosController.checkAdminBloqueio);

module.exports = router;