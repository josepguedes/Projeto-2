const db = require("../models/db.js");
const Mensagem = db.Mensagem;
const UtilizadorBloqueio = db.UtilizadorBloqueio; // Adicionar esta linha
const { Op } = require('sequelize');
const { ErrorHandler } = require("../utils/error.js");

const getMensagensChat = async (req, res, next) => {
    try {
        const { idRemetente, idDestinatario, page = 1, limit = 50 } = req.query;

        if (!idRemetente || !idDestinatario) {
            throw new ErrorHandler(400, 'IDs de remetente e destinatário são obrigatórios');
        }

        // Verificar bloqueios primeiro
        const bloqueioExistente = await UtilizadorBloqueio.findOne({
            where: {
                [Op.or]: [
                    {
                        IdBloqueador: idRemetente,
                        IdBloqueado: idDestinatario
                    },
                    {
                        IdBloqueador: idDestinatario,
                        IdBloqueado: idRemetente
                    }
                ]
            }
        });

        if (bloqueioExistente) {
            return res.status(403).json({
                message: 'Não é possível ver mensagens de utilizadores bloqueados',
                bloqueado: true
            });
        }

        // Buscar mensagens se não houver bloqueio
        const mensagens = await Mensagem.findAndCountAll({
            where: {
                [Op.or]: [
                    {
                        IdRemetente: idRemetente,
                        IdDestinatario: idDestinatario
                    },
                    {
                        IdRemetente: idDestinatario,
                        IdDestinatario: idRemetente
                    }
                ]
            },
            include: [
                {
                    model: db.Utilizador,
                    as: 'remetente',
                    attributes: ['Nome', 'ImagemPerfil']
                },
                {
                    model: db.Utilizador,
                    as: 'destinatario',
                    attributes: ['Nome', 'ImagemPerfil']
                }
            ],
            order: [['DataEnvio', 'ASC'], ['HoraEnvio', 'ASC']],
            limit: +limit,
            offset: (+page - 1) * +limit
        });

        return res.status(200).json({
            totalPages: Math.ceil(mensagens.count / limit),
            currentPage: +page,
            total: mensagens.count,
            data: mensagens.rows
        });
    } catch (err) {
        console.error('Erro em getMensagensChat:', err);
        next(err);
    }
};

// Send a new message
const createMensagem = async (req, res, next) => {
    try {
        const { IdRemetente, IdDestinatario, Conteudo } = req.body;

        if (!IdRemetente || !IdDestinatario || !Conteudo) {
            throw new ErrorHandler(400, 'Remetente, destinatário e conteúdo são obrigatórios');
        }

        // Verificar se existe bloqueio em qualquer direção
        const bloqueioExistente = await UtilizadorBloqueio.findOne({
            where: {
                [Op.or]: [
                    {
                        IdBloqueador: IdRemetente,
                        IdBloqueado: IdDestinatario
                    },
                    {
                        IdBloqueador: IdDestinatario,
                        IdBloqueado: IdRemetente
                    }
                ]
            }
        });

        if (bloqueioExistente) {
            throw new ErrorHandler(403, 'Não é possível enviar mensagens para utilizadores bloqueados');
        }

        const now = new Date();
        const portugalOffset = 60;
        const date = new Date(now.getTime() + (portugalOffset * 60000));

        const mensagem = await Mensagem.create({
            IdRemetente,
            IdDestinatario,
            Conteudo,
            DataEnvio: date,
            HoraEnvio: date
        });

        return res.status(201).json({
            message: 'Mensagem enviada com sucesso',
            data: mensagem
        });
    } catch (err) {
        next(err);
    }
};

// Delete a message
const deleteMensagem = async (req, res, next) => {
    try {
        const result = await Mensagem.destroy({
            where: { IdMensagem: req.params.id }
        });

        if (result === 0) {
            throw new ErrorHandler(404, 'Mensagem não encontrada');
        }

        res.status(204).json();
    } catch (err) {
        next(err);
    }
};

const getUserConversations = async (req, res, next) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            throw new ErrorHandler(400, 'ID do utilizador é obrigatório');
        }

        // Buscar todas as mensagens onde o usuário é remetente ou destinatário
        const conversations = await Mensagem.findAll({
            where: {
                [Op.or]: [
                    { IdRemetente: userId },
                    { IdDestinatario: userId }
                ]
            },
            include: [
                {
                    model: db.Utilizador,
                    as: 'remetente',
                    attributes: ['IdUtilizador', 'Nome', 'ImagemPerfil']
                },
                {
                    model: db.Utilizador,
                    as: 'destinatario',
                    attributes: ['IdUtilizador', 'Nome', 'ImagemPerfil']
                }
            ],
            order: [['DataEnvio', 'DESC'], ['HoraEnvio', 'DESC']]
        });

        const processedConversations = conversations.reduce((acc, message) => {
            const otherUser = message.IdRemetente == userId 
                ? message.destinatario 
                : message.remetente;
            
            const otherUserId = otherUser.IdUtilizador;

            if (!acc[otherUserId]) {
                const timeDiff = new Date() - new Date(message.DataEnvio);
                const minutes = Math.floor(timeDiff / 60000);
                const hours = Math.floor(minutes / 60);
                const days = Math.floor(hours / 24);

                let timeAgo;
                if (days > 0) {
                    timeAgo = `${days} dia${days > 1 ? 's' : ''} atrás`;
                } else if (hours > 0) {
                    timeAgo = `${hours} hora${hours > 1 ? 's' : ''} atrás`;
                } else if (minutes > 0) {
                    timeAgo = `${minutes} minuto${minutes > 1 ? 's' : ''} atrás`;
                } else {
                    timeAgo = 'agora mesmo';
                }

                acc[otherUserId] = {
                    otherUser: {
                        id: otherUser.IdUtilizador,
                        nome: otherUser.Nome,
                        imagemPerfil: otherUser.ImagemPerfil
                    },
                    ultimaMensagem: {
                        conteudo: message.Conteudo,
                        dataEnvio: message.DataEnvio,
                        horaEnvio: message.HoraEnvio,
                        timeAgo: timeAgo
                    }
                };
            }
            return acc;
        }, {});

        const conversationsList = Object.values(processedConversations);

        return res.status(200).json({
            data: conversationsList
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getMensagensChat,
    createMensagem,
    deleteMensagem,
    getUserConversations
};