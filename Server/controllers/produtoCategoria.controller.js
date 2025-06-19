const db = require("../models/db.js");
const ProdutoCategoria = db.ProdutoCategoria;
const { ErrorHandler } = require("../utils/error.js");

// Listar todas as categorias
const getAllCategorias = async (req, res, next) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        
        // Validar página e limite
        if (isNaN(page) || page < 1) {
            throw new ErrorHandler(400, 'Página inválida');
        }
        if (isNaN(limit) || limit < 1) {
            throw new ErrorHandler(400, 'Limite inválido');
        }

        const categorias = await ProdutoCategoria.findAndCountAll({
            order: [['NomeCategoria', 'ASC']],
            limit: +limit,
            offset: (+page - 1) * +limit
        });

        return res.status(200).json({
            totalPages: Math.ceil(categorias.count / limit),
            currentPage: +page,
            total: categorias.count,
            data: categorias.rows
        });
    } catch (err) {
        next(err);
    }
};

// Criar nova categoria
const createCategoria = async (req, res, next) => {
    try {
        const { NomeCategoria } = req.body;

        if (!NomeCategoria) {
            throw new ErrorHandler(400, "Nome da categoria é obrigatório");
        }

        const categoria = await ProdutoCategoria.create({ NomeCategoria });

        res.status(201).json({
            message: 'Categoria criada com sucesso',
            data: {
                IdProdutoCategoria: categoria.IdProdutoCategoria,
                NomeCategoria: categoria.NomeCategoria
            }
        });
    } catch (err) {
        next(err);
    }
};

// Deletar categoria
const deleteCategoria = async (req, res, next) => {
    try {
        const result = await ProdutoCategoria.destroy({
            where: { IdProdutoCategoria: req.params.id }
        });

        if (result === 0) {
            throw new ErrorHandler(404, `Categoria com ID ${req.params.id} não encontrada`);
        }

        res.status(204).json();
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getAllCategorias,
    createCategoria,
    deleteCategoria
};