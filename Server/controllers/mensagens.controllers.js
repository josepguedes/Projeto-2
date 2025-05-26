const db = require("../models/db.js");
const Mensagem = db.Mensagem;
const { Op } = require('sequelize'); // Add this import
const { ErrorHandler } = require("../utils/error.js");

// Get all messages for a chat between two users
const getMensagensChat = async (req, res, next) => {
    try {
        const { idRemetente, idDestinatario, page = 1, limit = 20 } = req.query;

        if (!idRemetente || !idDestinatario) {
            throw new ErrorHandler(400, 'IDs de remetente e destinatário são obrigatórios');
        }

        const where = {
            [Op.or]: [ // Now Op will be defined
                {
                    IdRemetente: idRemetente,
                    IdDestinatario: idDestinatario
                },
                {
                    IdRemetente: idDestinatario,
                    IdDestinatario: idRemetente
                }
            ]
        };

        const mensagens = await Mensagem.findAndCountAll({
            where,
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

        const mensagem = await Mensagem.create({
            IdRemetente,
            IdDestinatario,
            Conteudo,
            DataEnvio: new Date(),
            HoraEnvio: new Date()
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

module.exports = {
    getMensagensChat,
    createMensagem,
    deleteMensagem
};