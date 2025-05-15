const db = require('../models/db.js');
const Anuncio = db.Anuncio;
const { Op } = require('sequelize');
const { ErrorHandler } = require("../utils/error.js");

// Listar todos os anúncios com paginação e filtros
const getAllAnuncios = async (req, res, next) => {
    try {
        const { 
            nome,
            localRecolha, 
            page = 1, 
            limit = 10 
        } = req.query;
        const where = {};

        // Filtros
        if (nome) {
            where.Nome = { [Op.like]: `%${nome}%` };
        }
        if (localRecolha) {
            where.LocalRecolha = { [Op.like]: `%${localRecolha}%` };
        }

        // Validar página e limite
        if (isNaN(page) || page < 1) {
            throw new ErrorHandler(400, 'Página inválida');
        }
        if (isNaN(limit) || limit < 1) {
            throw new ErrorHandler(400, 'Limite inválido');
        }

        const anuncios = await Anuncio.findAndCountAll({
            where,
            order: [['DataAnuncio', 'DESC']],
            limit: +limit,
            offset: (+page - 1) * +limit,
        });

        // Links HATEOAS para cada anúncio
        anuncios.rows.forEach(anuncio => {
            anuncio.links = [
                { rel: "self", href: `/anuncios/${anuncio.IdAnuncio}`, method: "GET" },
                { rel: "delete", href: `/anuncios/${anuncio.IdAnuncio}`, method: "DELETE" },
                { rel: "modify", href: `/anuncios/${anuncio.IdAnuncio}`, method: "PUT" }
            ];
        });

        return res.status(200).json({
            totalPages: Math.ceil(anuncios.count / limit),
            currentPage: +page,
            total: anuncios.count,
            data: anuncios.rows,
            links: [
                { rel: "criar-anuncio", href: `/anuncios`, method: "POST" },
                ...(page > 1 ? [{ rel: "pagina-anterior", href: `/anuncios?limit=${limit}&page=${page - 1}`, method: "GET" }] : []),
                ...(anuncios.count > page * limit ? [{ rel: "proxima-pagina", href: `/anuncios?limit=${limit}&page=${+page + 1}`, method: "GET" }] : [])
            ]
        });
    } catch (err) {
        next(err);
    }
};

// Criar novo anúncio
const createAnuncio = async (req, res, next) => {
    try {
        const requiredFields = [
            'IdUtilizadorAnuncio',
            'Nome',
            'LocalRecolha',
            'HorarioRecolha',
            'Preco',
            'DataValidade',
            'Quantidade',
            'IdProdutoCategoria'
        ];

        const missingFields = requiredFields.filter(field => !req.body[field]);
        if (missingFields.length > 0) {
            throw new ErrorHandler(400, `Campos obrigatórios ausentes: ${missingFields.join(', ')}`);
        }

        const anuncio = await Anuncio.create({
            ...req.body,
            DataAnuncio: new Date(),
            IdEstadoAnuncio: 1 // Estado inicial (Disponível)
        });

        res.status(201).json({
            message: 'Anúncio criado com sucesso',
            data: anuncio,
            links: [
                { rel: "self", href: `/anuncios/${anuncio.IdAnuncio}`, method: "GET" },
                { rel: "delete", href: `/anuncios/${anuncio.IdAnuncio}`, method: "DELETE" },
                { rel: "modify", href: `/anuncios/${anuncio.IdAnuncio}`, method: "PUT" }
            ]
        });
    } catch (err) {
        next(err);
    }
};

// Atualizar anúncio
const updateAnuncio = async (req, res, next) => {
    try {
        const anuncio = await Anuncio.findByPk(req.params.id);

        if (!anuncio) {
            throw new ErrorHandler(404, `Anúncio com ID ${req.params.id} não encontrado`);
        }

        // Permitir apenas atualização de campos específicos
        const allowedUpdates = [
            'Nome',
            'Descricao',
            'LocalRecolha',
            'HorarioRecolha',
            'Preco',
            'DataValidade',
            'Quantidade',
            'IdEstadoAnuncio'
        ];

        const updateData = {};
        Object.keys(req.body).forEach(key => {
            if (allowedUpdates.includes(key)) {
                updateData[key] = req.body[key];
            }
        });

        await anuncio.update(updateData);
        res.status(200).json({
            message: 'Anúncio atualizado com sucesso',
            data: anuncio
        });
    } catch (err) {
        next(err);
    }
};

// Deletar anúncio
const deleteAnuncio = async (req, res, next) => {
    try {
        const result = await Anuncio.destroy({
            where: { IdAnuncio: req.params.id }
        });

        if (result === 0) {
            throw new ErrorHandler(404, `Anúncio com ID ${req.params.id} não encontrado`);
        }

        res.status(204).json();
    } catch (err) {
        next(err);
    }
};

// Obter anúncio por ID
const getAnuncioById = async (req, res, next) => {
    try {
        const anuncio = await Anuncio.findByPk(req.params.id);
        
        if (!anuncio) {
            throw new ErrorHandler(404, `Anúncio com ID ${req.params.id} não encontrado`);
        }

        res.status(200).json({
            data: anuncio,
            links: [
                { rel: "self", href: `/anuncios/${anuncio.IdAnuncio}`, method: "GET" },
                { rel: "delete", href: `/anuncios/${anuncio.IdAnuncio}`, method: "DELETE" },
                { rel: "modify", href: `/anuncios/${anuncio.IdAnuncio}`, method: "PUT" },
                { rel: "all", href: "/anuncios", method: "GET" }
            ]
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getAllAnuncios,
    createAnuncio,
    updateAnuncio,
    deleteAnuncio,
    getAnuncioById
}