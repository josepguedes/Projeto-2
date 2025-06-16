const express = require('express');
const router = express.Router();
const bloqueiosController = require('../controllers/bloqueios.controllers.js');
const autenticarJWT = require('../middleware/jwtAuth');

// Rotas para bloqueios entre utilizadores
router.get('/utilizador', autenticarJWT, bloqueiosController.getAllUtilizadorBloqueios);
router.get('/utilizador/check', bloqueiosController.checkUtilizadorBloqueio);
router.post('/utilizador',autenticarJWT ,bloqueiosController.createUtilizadorBloqueio);
router.delete('/utilizador/:id',autenticarJWT,bloqueiosController.deleteUtilizadorBloqueio);

// Rotas para bloqueios administrativos - remova os middlewares para testes
router.get('/admin', (req, res, next) => autenticarJWT(req, res, next, true), bloqueiosController.getAllAdminBloqueios); 
router.get('/admin/:id', (req, res, next) => autenticarJWT(req, res, next, true), bloqueiosController.getAdminBloqueioById);
router.post('/admin', (req, res, next) => autenticarJWT(req, res, next, true), bloqueiosController.createAdminBloqueio);
router.delete('/admin/:id', (req, res, next) => autenticarJWT(req, res, next, true), bloqueiosController.deleteAdminBloqueio);
router.get('/admin/check/:id', bloqueiosController.checkAdminBloqueio);

module.exports = router;