const db = require("../models/db.js");
const Avaliacao = db.Avaliacao;
const { ErrorHandler } = require("../utils/error.js");

// Listar todas as avaliações com paginação e filtros
const getAllAvaliacoes = async (req, res, next) => {
    try {
        const { idAvaliado, page = 1, limit = 10 } = req.query;
        const where = {};

        // 1. Validate pagination parameters
        if (isNaN(page) || page <= 0) {
            throw new ErrorHandler(400, "Número de página inválido. Deve ser um número positivo");
        }

        if (isNaN(limit) || limit < 1 || limit > 100) {
            throw new ErrorHandler(400, "Limite inválido. Deve ser um número entre 1 e 100");
        }

        // 2. Validate idAvaliado if provided
        if (idAvaliado) {
            if (!Number.isInteger(Number(idAvaliado)) || Number(idAvaliado) <= 0) {
                throw new ErrorHandler(400, "ID do avaliado inválido");
            }
            where.IdAvaliado = idAvaliado;
        }

        // 3. Try to fetch avaliacoes
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
            order: [['DataAvaliacao', 'ASC']],
            limit: +limit,
            offset: (+page - 1) * +limit,
        }).catch(error => {
            console.error('Database error:', error);
            throw new ErrorHandler(500, "Erro ao buscar avaliações na base de dados");
        });

        // 4. Check if there are any avaliacoes
        if (avaliacoes.count === 0) {
            return res.status(204).json({
                message: "Nenhuma avaliação encontrada",
                totalPages: 0,
                currentPage: +page,
                total: 0,
                data: []
            });
        }

        // 5. Check if requested page exists
        const totalPages = Math.ceil(avaliacoes.count / limit);
        if (page > totalPages) {
            throw new ErrorHandler(404, `Página ${page} não existe. Total de páginas: ${totalPages}`);
        }

        // 6. Add HATEOAS links
        try {
            avaliacoes.rows.forEach(avaliacao => {
                avaliacao.links = [
                    { rel: "self", href: `/avaliacoes/${avaliacao.IdAvaliacao}`, method: "GET" },
                    { rel: "delete", href: `/avaliacoes/${avaliacao.IdAvaliacao}`, method: "DELETE" },
                    { rel: "modify", href: `/avaliacoes/${avaliacao.IdAvaliacao}`, method: "PUT" }
                ];
            });
        } catch (error) {
            console.error('Error adding HATEOAS links:', error);
        }

        // 7. Return success response
        return res.status(200).json({
            totalPages,
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
        // 8. Error handling
        if (err.name === 'SequelizeConnectionError') {
            return next(new ErrorHandler(503, "Erro de conexão com a base de dados"));
        }
        if (err.name === 'SequelizeDatabaseError') {
            return next(new ErrorHandler(500, "Erro na base de dados"));
        }
        next(err);
    }
};

const createAvaliacao = async (req, res, next) => {
    try {
        const { IdAnuncio, IdAutor, IdAvaliado, Comentario, Classificacao } = req.body;

        // Validar dados obrigatórios
        if (!IdAnuncio || !IdAutor || !IdAvaliado || !Classificacao) {
            throw new ErrorHandler(400, 'Dados obrigatórios não fornecidos');
        }

        // Buscar o anúncio e verificar se está finalizado
        const anuncio = await db.Anuncio.findByPk(IdAnuncio);
        if (!anuncio || anuncio.IdEstadoAnuncio !== 3) {
            throw new ErrorHandler(400, 'A entrega ainda não foi finalizada');
        }

        // Verificar se já existe avaliação deste autor para este anúncio
        const avaliacaoExistente = await db.Avaliacao.findOne({
            where: { IdAnuncio, IdAutor }
        });
        if (avaliacaoExistente) {
            throw new ErrorHandler(400, 'Já existe uma avaliação deste utilizador para este anúncio');
        }

        // Criar nova avaliação
        const novaAvaliacao = await db.Avaliacao.create({
            IdAnuncio,
            IdAutor,
            IdAvaliado,
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
// ...existing code...

// Editar uma avaliação
const updateAvaliacao = async (req, res, next) => {
    try {
        const avaliacao = await Avaliacao.findByPk(req.params.id);

        if (!avaliacao) {
            throw new ErrorHandler(404, `Avaliação com ID ${req.params.id} não encontrada`);
        }

        // Validar dados obrigatórios
        if (!req.body.Comentario || !req.body.Classificacao) {
            throw new ErrorHandler(400, 'Dados obrigatórios não fornecidos');
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