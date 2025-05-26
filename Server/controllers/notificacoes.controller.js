const db = require("../models/db.js");
const Notificacao = db.Notificacao;
const { Op } = require("sequelize");
const { ErrorHandler } = require("../utils/error.js");

// Listar todas as notificações com paginação
const getAllNotificacoes = async (req, res, next) => {
    try {
        const { 
            idRecipiente,
            page = 1, 
            limit = 10 
        } = req.query;
        
        // Validar página e limite
        if (isNaN(page) || page < 1) {
            throw new ErrorHandler(400, 'Página inválida');
        }
        if (isNaN(limit) || limit < 1) {
            throw new ErrorHandler(400, 'Limite inválido');
        }

        const where = {};

        // Filtros
        if (idRecipiente) {
            where.IdRecipiente = idRecipiente;
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

        // Adicionar links HATEOAS para cada notificação
        notificacoes.rows.forEach(notificacao => {
            notificacao.links = [
                { rel: "self", href: `/notificacoes/${notificacao.IdNotificacao}`, method: "GET" },
                { rel: "delete", href: `/notificacoes/${notificacao.IdNotificacao}`, method: "DELETE" },
                { rel: "modify", href: `/notificacoes/${notificacao.IdNotificacao}`, method: "PUT" }
            ];
        });

        return res.status(200).json({
            totalPages: Math.ceil(notificacoes.count / limit),
            currentPage: +page,
            total: notificacoes.count,
            data: notificacoes.rows,
            links: [
                { rel: "criar-notificacao", href: `/notificacoes`, method: "POST" },
                ...(page > 1 ? [{ rel: "pagina-anterior", href: `/notificacoes?limit=${limit}&page=${page - 1}`, method: "GET" }] : []),
                ...(notificacoes.count > page * limit ? [{ rel: "proxima-pagina", href: `/notificacoes?limit=${limit}&page=${+page + 1}`, method: "GET" }] : [])
            ]
        });
    } catch (err) {
        next(err);
    }
};

// Criar uma nova notificação
const createNotificacao = async (req, res, next) => {
    try {
        const { IdRecipiente, Mensagem } = req.body;

        // Validar campos obrigatórios
        if (!IdRecipiente || !Mensagem) {
            throw new ErrorHandler(400, "IdRecipiente e Mensagem são obrigatórios");
        }

        const novaNotificacao = await Notificacao.create({
            IdRecipiente,
            Mensagem,
            DataNotificacao: new Date(),
            HoraNotificacao: new Date(),
            Estado: 'não lida'
        });

        return res.status(201).json({
            message: 'Notificação criada com sucesso',
            data: novaNotificacao,
            links: [
                { rel: "self", href: `/notificacoes/${novaNotificacao.IdNotificacao}`, method: "GET" },
                { rel: "delete", href: `/notificacoes/${novaNotificacao.IdNotificacao}`, method: "DELETE" },
                { rel: "modify", href: `/notificacoes/${novaNotificacao.IdNotificacao}`, method: "PUT" }
            ]
        });
    } catch (err) {
        next(err);
    }
};

// Deletar uma notificação
const deleteNotificacao = async (req, res, next) => {
    try {
        const result = await Notificacao.destroy({
            where: { IdNotificacao: req.params.id }
        });

        if (result === 0) {
            throw new ErrorHandler(404, `Notificação com ID ${req.params.id} não encontrada`);
        }

        return res.status(204).json();
    } catch (err) {
        next(err);
    }
};

// Atualizar uma notificação
const updateNotificacao = async (req, res, next) => {
    try {
        const notificacao = await Notificacao.findByPk(req.params.id);

        if (!notificacao) {
            throw new ErrorHandler(404, `Notificação com ID ${req.params.id} não encontrada`);
        }

        const { Estado } = req.body;
        await notificacao.update({ Estado });

        return res.status(200).json({
            message: 'Notificação atualizada com sucesso',
            data: notificacao,
            links: [
                { rel: "self", href: `/notificacoes/${notificacao.IdNotificacao}`, method: "GET" },
                { rel: "delete", href: `/notificacoes/${notificacao.IdNotificacao}`, method: "DELETE" },
                { rel: "modify", href: `/notificacoes/${notificacao.IdNotificacao}`, method: "PUT" }
            ]
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getAllNotificacoes,
    createNotificacao,
    deleteNotificacao,
    updateNotificacao
};