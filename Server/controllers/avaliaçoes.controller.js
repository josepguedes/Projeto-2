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

        if (idAvaliado) {
            if (!Number.isInteger(Number(idAvaliado)) || Number(idAvaliado) <= 0) {
                throw new ErrorHandler(400, "ID do avaliado inválido");
            }
            
            // Check if avaliado exists
            const avaliado = await db.Utilizador.findByPk(idAvaliado);
            if (!avaliado) {
                throw new ErrorHandler(404, `Utilizador com ID ${idAvaliado} não encontrado`);
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

        // Check if user is authenticated and is the author
        if (req.user.IdUtilizador != IdAutor) {
            return res.status(403).json({
                message: "Não tem permissão para criar avaliações em nome de outro utilizador"
            });
        }

        // Validate required fields
        if (!IdAnuncio || !IdAutor || !IdAvaliado || !Comentario || !Classificacao) {
            throw new ErrorHandler(400, "Todos os campos são obrigatórios");
        }

        // Validate IDs format
        if (!Number.isInteger(Number(IdAnuncio)) || Number(IdAnuncio) <= 0) {
            throw new ErrorHandler(400, "ID do anúncio inválido");
        }

        if (!Number.isInteger(Number(IdAutor)) || Number(IdAutor) <= 0) {
            throw new ErrorHandler(400, "ID do autor inválido");
        }

        if (!Number.isInteger(Number(IdAvaliado)) || Number(IdAvaliado) <= 0) {
            throw new ErrorHandler(400, "ID do avaliado inválido");
        }

        // Validate classification range
        if (!Number.isInteger(Number(Classificacao)) || Classificacao < 1 || Classificacao > 5) {
            throw new ErrorHandler(400, "Classificação deve ser um número entre 1 e 5");
        }

        // Validate comment length
        if (Comentario.length <= 1 || Comentario.length > 255) {
            throw new ErrorHandler(400, "Comentário deve ter no máximo 255 caracteres");
        }

        // Check if users exist
        const [autor, avaliado] = await Promise.all([
            db.Utilizador.findByPk(IdAutor),
            db.Utilizador.findByPk(IdAvaliado)
        ]);

        if (!autor || !avaliado) {
            throw new ErrorHandler(404, "Autor ou avaliado não encontrado");
        }

        // Check if anuncio exists and is finalized
        const anuncio = await db.Anuncio.findByPk(IdAnuncio);
        if (!anuncio) {
            throw new ErrorHandler(404, "Anúncio não encontrado");
        }

        if (anuncio.IdEstadoAnuncio !== 3) {
            throw new ErrorHandler(400, "Só é possível avaliar anúncios finalizados");
        }

        // Check if user already evaluated this announcement
        const avaliacaoExistente = await Avaliacao.findOne({
            where: { IdAnuncio, IdAutor }
        });

        if (avaliacaoExistente) {
            throw new ErrorHandler(409, "Já existe uma avaliação sua para este anúncio");
        }

        // Create evaluation
        const novaAvaliacao = await Avaliacao.create({
            IdAnuncio,
            IdAutor,
            IdAvaliado,
            Comentario,
            Classificacao,
            DataAvaliacao: new Date()
        });

        return res.status(201).json({
            message: "Avaliação criada com sucesso",
            data: novaAvaliacao
        });

    } catch (err) {
        console.error("Erro em createAvaliacao:", err);

        if (err instanceof ErrorHandler) {
            return next(err);
        }

        if (err.name === 'SequelizeValidationError') {
            return next(new ErrorHandler(400, "Erro de validação dos dados"));
        }

        if (err.name === 'SequelizeUniqueConstraintError') {
            return next(new ErrorHandler(409, "Avaliação duplicada"));
        }

        if (err.name === 'SequelizeForeignKeyConstraintError') {
            return next(new ErrorHandler(400, "Referência inválida: anúncio ou utilizador não existe"));
        }

        if (err.name === 'SequelizeDatabaseError') {
            return next(new ErrorHandler(500, "Erro de banco de dados"));
        }

        next(new ErrorHandler(500, "Erro interno do servidor ao criar avaliação"));
    }
};

// Editar uma avaliação
const updateAvaliacao = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { Comentario, Classificacao } = req.body;

        // Validate if id exists and is valid
        if (!id || isNaN(id)) {
            throw new ErrorHandler(400, "ID da avaliação inválido");
        }

        // Find avaliacao
        const avaliacao = await Avaliacao.findByPk(id);
        if (!avaliacao) {
            throw new ErrorHandler(404, `Avaliação com ID ${id} não encontrada`);
        }

        // Check if user owns the evaluation
        if (req.user.IdUtilizador != avaliacao.IdAutor) {
            return res.status(403).json({
                message: "Não tem permissão para editar avaliações de outros utilizadores"
            });
        }

        // Validate required fields
        if (!Comentario && !Classificacao) {
            throw new ErrorHandler(400, "Nenhum campo para atualizar foi fornecido");
        }

        // Validate Comentario if provided
        if (Comentario !== undefined) {
            if (Comentario.length < 3 || Comentario.length > 255) {
                throw new ErrorHandler(400, "Comentário deve ter no máximo 255 caracteres");
            }
        }

        // Validate Classificacao if provided
        if (Classificacao !== undefined) {
            if (!Number.isInteger(Number(Classificacao)) || Classificacao < 1 || Classificacao > 5) {
                throw new ErrorHandler(400, "Classificação deve ser um número entre 1 e 5");
            }
        }

        // Update avaliacao
        await avaliacao.update({
            Comentario: Comentario || avaliacao.Comentario,
            Classificacao: Classificacao || avaliacao.Classificacao
        });

        return res.status(200).json({
            message: "Avaliação atualizada com sucesso",
            data: avaliacao,
            links: [
                { rel: "self", href: `/avaliacoes/${avaliacao.IdAvaliacao}`, method: "GET" },
                { rel: "delete", href: `/avaliacoes/${avaliacao.IdAvaliacao}`, method: "DELETE" },
                { rel: "modify", href: `/avaliacoes/${avaliacao.IdAvaliacao}`, method: "PUT" }
            ]
        });

    } catch (err) {
        console.error("Erro em updateAvaliacao:", err);

        if (err instanceof ErrorHandler) {
            return next(err);
        }

        if (err.name === 'SequelizeValidationError') {
            return next(new ErrorHandler(400, "Erro de validação dos dados"));
        }

        if (err.name === 'SequelizeUniqueConstraintError') {
            return next(new ErrorHandler(409, "Avaliação duplicada"));
        }

        if (err.name === 'SequelizeDatabaseError') {
            return next(new ErrorHandler(500, "Erro de banco de dados"));
        }

        next(new ErrorHandler(500, "Erro interno do servidor ao atualizar avaliação"));
    }
};

// Eliminar uma avaliação
const deleteAvaliacao = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Validate if ID exists and is valid
        if (!id || isNaN(id)) {
            throw new ErrorHandler(400, "ID da avaliação inválido");
        }

        // Find avaliacao
        const avaliacao = await Avaliacao.findByPk(id);
        if (!avaliacao) {
            throw new ErrorHandler(404, `Avaliação com ID ${id} não encontrada`);
        }

        // Check if user owns the evaluation or is admin
        if (!req.user.IsAdmin && req.user.IdUtilizador != avaliacao.IdAutor) {
            return res.status(403).json({
                message: "Apenas o autor da avaliação ou um administrador pode eliminá-la"
            });
        }

        // Delete evaluation
        await avaliacao.destroy();

        return res.status(200).json({
            message: 'Avaliação eliminada com sucesso',
            links: [
                { rel: "criar-avaliacao", href: `/avaliacoes`, method: "POST" },
                { rel: "listar-avaliacoes", href: `/avaliacoes`, method: "GET" }
            ]
        });

    } catch (err) {
        console.error("Erro em deleteAvaliacao:", err);

        if (err instanceof ErrorHandler) {
            return next(err);
        }

        if (err.name === 'SequelizeValidationError') {
            return next(new ErrorHandler(400, "Erro de validação dos dados"));
        }

        if (err.name === 'SequelizeForeignKeyConstraintError') {
            return next(new ErrorHandler(400, "Erro: A avaliação não pode ser eliminada devido a dependências"));
        }

        if (err.name === 'SequelizeDatabaseError') {
            return next(new ErrorHandler(500, "Erro de banco de dados"));
        }

        next(new ErrorHandler(500, "Erro interno do servidor ao eliminar avaliação"));
    }
};

module.exports = {
    getAllAvaliacoes,
    createAvaliacao,
    updateAvaliacao,
    deleteAvaliacao
};