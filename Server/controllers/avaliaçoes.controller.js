const db = require("../models/db.js");
const Avaliacao = db.Avaliacao;
const { ErrorHandler } = require("../utils/error.js");

// Listar todas as avaliações com paginação e filtros
const getAllAvaliacoes = async (req, res, next) => {
    try {
        const { idAvaliado, page = 1, limit = 10 } = req.query;
        const where = {};

        if (idAvaliado) {
            where.IdAvaliado = idAvaliado;
        }

        const avaliacoes = await Avaliacao.findAndCountAll({
            where,
            include: [{
                model: db.Utilizador,
                as: 'autor',
                attributes: ['Nome', 'ImagemPerfil'],
                where: {
                    IdUtilizador: db.sequelize.col('Avaliacao.IdAutor')
                }
            }],
            order: [['DataAvaliacao', 'DESC']],
            limit: +limit,
            offset: (+page - 1) * +limit,
        });

        // Links HATEOAS para cada avaliação
        avaliacoes.rows.forEach(avaliacao => {
            avaliacao.links = [
                { rel: "self", href: `/avaliacoes/${avaliacao.IdAvaliacao}`, method: "GET" }, // Corrigido de IdDenuncia
                { rel: "delete", href: `/avaliacoes/${avaliacao.IdAvaliacao}`, method: "DELETE" },
                { rel: "modify", href: `/avaliacoes/${avaliacao.IdAvaliacao}`, method: "PUT" }
            ];
        });

        return res.status(200).json({
            totalPages: Math.ceil(avaliacoes.count / limit),
            currentPage: +page,
            total: avaliacoes.count,
            data: avaliacoes.rows,
            links: [
                { rel: "criar-avaliacao", href: `/avaliacoes`, method: "POST" },
                ...(page > 1 ? [{ rel: "pagina-anterior", href: `/avaliacoes?limit=${limit}&page=${page - 1}`, method: "GET" }] : []),
                ...(avaliacoes.count > page * limit ? [{ rel: "proxima-pagina", href: `/avaliacoes?limit=${limit}&page=${+page + 1}`, method: "GET" }] : [])
            ]
        });
    } catch (err) {
        next(err);
    }
};

// Criar uma nova avaliação
const createAvaliacao = async (req, res, next) => {
    try {
        const { 
            IdAnuncio,
            IdAutor,
            idAvaliado,
            Comentario,
            Classificacao
        } = req.body;

        // Validar dados obrigatórios
        if (!IdAnuncio || !IdAutor || !idAvaliado || !Classificacao) {
            throw new ErrorHandler(400, 'Dados obrigatórios não fornecidos');
        }

        // Criar nova avaliação
        const novaAvaliacao = await Avaliacao.create({
            IdAnuncio,
            IdAutor,
            idAvaliado,
            Comentario,
            Classificacao,
            DataAvaliacao: new Date()
        });

        return res.status(201).json({
            message: 'Avaliação criada com sucesso',
            data: novaAvaliacao,
            links: [
                { rel: "self", href: `/avaliacoes/${novaAvaliacao.IdAvaliacao}`, method: "GET" },
                { rel: "delete", href: `/avaliacoes/${novaAvaliacao.IdAvaliacao}`, method: "DELETE" },
                { rel: "modify", href: `/avaliacoes/${novaAvaliacao.IdAvaliacao}`, method: "PUT" }
            ]
        });
    } catch (err) {
        next(err);
    }
};

// Editar uma avaliação
const updateAvaliacao = async (req, res, next) => {
    try {
        const avaliacao = await Avaliacao.findByPk(req.params.id);

        if (!avaliacao) {
            throw new ErrorHandler(404, `Avaliação com ID ${req.params.id} não encontrada`);
        }

        const { Comentario, Classificacao } = req.body;

        // Atualizar avaliação
        await avaliacao.update({
            Comentario,
            Classificacao
        });

        return res.status(200).json({
            message: 'Avaliação atualizada com sucesso',
            data: avaliacao,
            links: [
                { rel: "self", href: `/avaliacoes/${avaliacao.IdAvaliacao}`, method: "GET" },
                { rel: "delete", href: `/avaliacoes/${avaliacao.IdAvaliacao}`, method: "DELETE" },
                { rel: "modify", href: `/avaliacoes/${avaliacao.IdAvaliacao}`, method: "PUT" }
            ]
        });
    } catch (err) {
        next(err);
    }
};

// Eliminar uma avaliação
const deleteAvaliacao = async (req, res, next) => {
    try {
        const avaliacao = await Avaliacao.findByPk(req.params.id);

        if (!avaliacao) {
            throw new ErrorHandler(404, `Avaliação com ID ${req.params.id} não encontrada`);
        }

        await avaliacao.destroy();

        return res.status(200).json({
            message: 'Avaliação eliminada com sucesso',
            links: [
                { rel: "criar-avaliacao", href: `/avaliacoes`, method: "POST" },
                { rel: "listar-avaliacoes", href: `/avaliacoes`, method: "GET" }
            ]
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getAllAvaliacoes,
    createAvaliacao,
    updateAvaliacao,
    deleteAvaliacao
};