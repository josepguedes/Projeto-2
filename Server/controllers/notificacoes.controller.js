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

        if (!req.user || req.user.Funcao !== 'admin') {
            throw new ErrorHandler(403, 'Acesso negado. Apenas administradores podem listar utilizadores.');
        }

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

        if (!IdRecipiente || !Mensagem) {
            throw new ErrorHandler(400, "IdRecipiente e Mensagem são obrigatórios");
        }

        const novaNotificacao = await Notificacao.create({
            IdRecipiente,
            Mensagem,
            DataNotificacao: new Date(),
            HoraNotificacao: new Date()
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

// Exibir notificações do usuário autenticado
const getNotificacoesByUserId = async (req, res, next) => {
    console.log("Backend: getNotificacoesByUserId - Recebido pedido.");
    try {
        const userId = req.query.idUtilizador;
        console.log("Backend: getNotificacoesByUserId - idUtilizador recebido:", userId);

        if (!userId) {
            console.log("Backend: getNotificacoesByUserId - idUtilizador em falta.");
            return res.status(400).json({ message: 'idUtilizador é obrigatório como query parameter' });
        }

        const userNotifications = await db.NotificacaoUtilizador.findAll({
            where: { IdUtilizador: userId },
            include: [{
                model: db.Notificacao,
                as: 'notificacao',
            }],
            order: [['DataRececao', 'DESC']],
        });
        console.log("Backend: getNotificacoesByUserId - Notificações encontradas na BD:", JSON.stringify(userNotifications, null, 2));

        const formattedNotificacoes = userNotifications.map(nu => {
            if (!nu.notificacao) {
                console.error(`Backend: NotificacaoUtilizador ID ${nu.IdNotificacaoUtilizador} não tem 'notificacao' associada ou 'notificacao' é null.`);
                return null;
            }
            return {
                IdAssociacao: nu.IdNotificacaoUtilizador,
                Mensagem: nu.notificacao.Mensagem,
                DataRececaoPeloUtilizador: nu.DataRececao,
                HoraNotificacaoOriginal: nu.notificacao.HoraNotificacao,
                DataNotificacaoOriginal: nu.notificacao.DataNotificacao
            };
        }).filter(n => n !== null);
        console.log("Backend: getNotificacoesByUserId - Notificações formatadas para enviar:", JSON.stringify(formattedNotificacoes, null, 2)); // Log 5

        return res.status(200).json({ data: formattedNotificacoes });

    } catch (err) {
        console.error("Backend: Erro em getNotificacoesByUserId:", err); // Log 6
        next(err);
    }
};

const associarNotificacaoAUtilizador = async (req, res, next) => {
    try {
        const { IdNotificacao, IdUtilizador } = req.body;
        if (!IdNotificacao || !IdUtilizador) {
            throw new ErrorHandler(400, "IdNotificacao e IdUtilizador são obrigatórios");
        }

        const notificacaoExiste = await Notificacao.findByPk(IdNotificacao);
        if (!notificacaoExiste) {
            throw new ErrorHandler(404, `Notificação com ID ${IdNotificacao} não encontrada.`);
        }

        const utilizadorExiste = await db.Utilizador.findByPk(IdUtilizador);
        if (!utilizadorExiste) {
            throw new ErrorHandler(404, `Utilizador com ID ${IdUtilizador} não encontrado.`);
        }

        const novaAssociacao = await db.NotificacaoUtilizador.create({
            IdNotificacao,
            IdUtilizador,
            DataRececao: new Date(),
        });

        res.status(201).json({ message: "Notificação associada ao utilizador com sucesso", data: novaAssociacao });
    } catch (err) {
        // Check if it's already an ErrorHandler instance
        if (err instanceof ErrorHandler) {
            return next(err);
        }
        // Handle Sequelize validation errors specifically
        if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
            const messages = err.errors.map(e => e.message).join(', ');
            return next(new ErrorHandler(400, `Erro de validação: ${messages}`));
        }
        // Handle Sequelize foreign key constraint errors
        if (err.name === 'SequelizeForeignKeyConstraintError') {
            return next(new ErrorHandler(400, `Erro de referência a dados inexistentes: ${err.message}`));
        }
        // For other generic or database errors
        console.error("Erro não tratado em associarNotificacaoAUtilizador:", err);
        next(new ErrorHandler(500, "Ocorreu um erro interno ao tentar associar a notificação."));
    }
};


module.exports = {
    getAllNotificacoes,
    createNotificacao,
    deleteNotificacao,
    updateNotificacao,
    getNotificacoesByUserId,
    associarNotificacaoAUtilizador
};