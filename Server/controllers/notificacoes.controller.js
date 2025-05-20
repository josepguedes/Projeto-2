const db = require("../models/db.js");
const Notificacao = db.Notificacao;
const { Op } = require("sequelize");
const { ErrorHandler } = require("../utils/error.js");

// Listar todas as notificações com paginação
const getAllNotificacoes = async (req, res, next) => {
    try {
        const { 
            idRecipiente,
            estado,
            page = 1, 
            limit = 10 
        } = req.query;
        
        const where = {};

        // Filtros
        if (idRecipiente) {
            where.IdRecipiente = idRecipiente;
        }
        if (estado) {
            where.Estado = estado;
        }

        const notificacoes = await Notificacao.findAndCountAll({
            where,
            include: [{
                model: db.Utilizador,
                as: 'recipiente',
                attributes: ['Nome', 'ImagemPerfil']
            }],
            order: [
                ['DataNotificacao', 'DESC'],
                ['HoraNotificacao', 'DESC']
            ],
            limit: +limit,
            offset: (+page - 1) * +limit,
        });

        return res.status(200).json({
            totalPages: Math.ceil(notificacoes.count / limit),
            currentPage: +page,
            total: notificacoes.count,
            data: notificacoes.rows
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getAllNotificacoes
};