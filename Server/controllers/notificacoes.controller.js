const db = require("../models/db.js");
const Notificacao = db.Notificacao;
const { Op } = require("sequelize");
const { ErrorHandler } = require("../utils/error.js");

// Listar todas as notificações com paginação
const getAllNotificacoes = async (req, res, next) => {
  try {
    const { idRecipiente, page = 1, limit = 10 } = req.query;

    // Validar página e limite
    if (isNaN(page) || page < 1) {
      throw new ErrorHandler(400, "Página inválida");
    }
    if (isNaN(limit) || limit < 1 || limit > 100) {
      throw new ErrorHandler(400, "Limite deve ser um número entre 1 e 100");
    }

    // Validate idRecipiente if provided
    if (idRecipiente) {
      if (
        !Number.isInteger(Number(idRecipiente)) ||
        Number(idRecipiente) <= 0
      ) {
        throw new ErrorHandler(
          400,
          "ID do recipiente deve ser um número válido"
        );
      }

      // Check if recipient exists
      const recipiente = await db.Utilizador.findByPk(idRecipiente);
      if (!recipiente) {
        throw new ErrorHandler(404, "Recipiente não encontrado");
      }
    }

    const where = {};
    if (idRecipiente) {
      where.IdRecipiente = idRecipiente;
    }

    // Verify admin access
    if (!req.user || req.user.Funcao !== "admin") {
      throw new ErrorHandler(
        403,
        "Acesso negado. Apenas administradores podem listar notificações."
      );
    }

    // Try to fetch notifications
    const notificacoes = await Notificacao.findAndCountAll({
      where,
      include: [
        {
          model: db.Utilizador,
          as: "recipiente",
          attributes: ["Nome", "ImagemPerfil"],
        },
      ],
      order: [
        ["DataNotificacao", "DESC"],
        ["HoraNotificacao", "DESC"],
      ],
      limit: +limit,
      offset: (+page - 1) * +limit,
    }).catch((error) => {
      throw new ErrorHandler(
        500,
        "Erro ao buscar notificações no banco de dados"
      );
    });

    // Check if there are any notifications
    if (notificacoes.count === 0) {
      return res.status(204).json({
        message: "Nenhuma notificação encontrada",
        totalPages: 0,
        currentPage: +page,
        total: 0,
        data: [],
      });
    }

    // Check if requested page exists
    const totalPages = Math.ceil(notificacoes.count / limit);
    if (page > totalPages) {
      throw new ErrorHandler(
        404,
        `Página ${page} não existe. Total de páginas: ${totalPages}`
      );
    }

    // Add HATEOAS links to each notification
    notificacoes.rows.forEach((notificacao) => {
      notificacao.links = [
        {
          rel: "self",
          href: `/notificacoes/${notificacao.IdNotificacao}`,
          method: "GET",
        },
        {
          rel: "delete",
          href: `/notificacoes/${notificacao.IdNotificacao}`,
          method: "DELETE",
        },
        {
          rel: "modify",
          href: `/notificacoes/${notificacao.IdNotificacao}`,
          method: "PUT",
        },
      ];
    });

    // Return success response with pagination and HATEOAS
    return res.status(200).json({
      totalPages,
      currentPage: +page,
      total: notificacoes.count,
      data: notificacoes.rows,
      links: [
        { rel: "criar-notificacao", href: `/notificacoes`, method: "POST" },
        ...(page > 1
          ? [
              {
                rel: "pagina-anterior",
                href: `/notificacoes?limit=${limit}&page=${page - 1}`,
                method: "GET",
              },
            ]
          : []),
        ...(notificacoes.count > page * limit
          ? [
              {
                rel: "proxima-pagina",
                href: `/notificacoes?limit=${limit}&page=${+page + 1}`,
                method: "GET",
              },
            ]
          : []),
      ],
    });
  } catch (err) {
    console.error("Erro em getAllNotificacoes:", err);

    if (err instanceof ErrorHandler) {
      return next(err);
    }

    if (err.name === "SequelizeValidationError") {
      return next(new ErrorHandler(400, "Erro de validação dos dados"));
    }

    if (err.name === "SequelizeDatabaseError") {
      return next(new ErrorHandler(500, "Erro de banco de dados"));
    }

    if (err.name === "SequelizeConnectionError") {
      return next(
        new ErrorHandler(503, "Erro de conexão com o banco de dados")
      );
    }

    next(
      new ErrorHandler(500, "Erro interno do servidor ao buscar notificações")
    );
  }
};

// Criar uma nova notificação
const createNotificacao = async (req, res, next) => {
  try {
    const { IdRecipiente, Mensagem } = req.body;

    if (req.user.Funcao !== "admin") {
      throw new ErrorHandler(
        403,
        "Acesso negado. Apenas administradores podem criar notificações"
      );
    }

    // 1. Validate required fields
    if (!IdRecipiente || !Mensagem) {
      throw new ErrorHandler(400, "IdRecipiente e Mensagem são obrigatórios");
    }

    // 2. Validate IdRecipiente format
    if (!Number.isInteger(Number(IdRecipiente)) || Number(IdRecipiente) <= 0) {
      throw new ErrorHandler(400, "ID do recipiente deve ser um número válido");
    }

    // 3. Validate Mensagem length
    if (typeof Mensagem !== "string" || Mensagem.trim().length < 1) {
      throw new ErrorHandler(400, "Mensagem deve ser um texto não vazio");
    }

    if (Mensagem.length > 255) {
      throw new ErrorHandler(400, "Mensagem excede o limite de 255 caracteres");
    }

    // 4. Check if recipient exists
    const recipiente = await db.Utilizador.findByPk(IdRecipiente);
    if (!recipiente) {
      throw new ErrorHandler(404, "Recipiente não encontrado");
    }

    // 5. Create notification
    const novaNotificacao = await Notificacao.create({
      IdRecipiente,
      Mensagem: Mensagem.trim(),
      DataNotificacao: new Date(),
      HoraNotificacao: new Date(),
    });

    // 6. Return success response with HATEOAS
    return res.status(201).json({
      message: "Notificação criada com sucesso",
      data: novaNotificacao,
      links: [
        {
          rel: "self",
          href: `/notificacoes/${novaNotificacao.IdNotificacao}`,
          method: "GET",
        },
        {
          rel: "delete",
          href: `/notificacoes/${novaNotificacao.IdNotificacao}`,
          method: "DELETE",
        },
        {
          rel: "modify",
          href: `/notificacoes/${novaNotificacao.IdNotificacao}`,
          method: "PUT",
        },
        { rel: "list", href: "/notificacoes", method: "GET" },
      ],
    });
  } catch (err) {
    console.error("Erro em createNotificacao:", err);

    if (err instanceof ErrorHandler) {
      return next(err);
    }

    if (err.name === "SequelizeValidationError") {
      return next(new ErrorHandler(400, "Erro de validação dos dados"));
    }

    if (err.name === "SequelizeUniqueConstraintError") {
      return next(new ErrorHandler(409, "Notificação duplicada"));
    }

    if (err.name === "SequelizeForeignKeyConstraintError") {
      return next(
        new ErrorHandler(400, "Referência inválida: recipiente não existe")
      );
    }

    if (err.name === "SequelizeDatabaseError") {
      return next(new ErrorHandler(500, "Erro de banco de dados"));
    }

    if (err.name === "SequelizeConnectionError") {
      return next(
        new ErrorHandler(503, "Erro de conexão com o banco de dados")
      );
    }

    next(
      new ErrorHandler(500, "Erro interno do servidor ao criar notificação")
    );
  }
};

// Deletar uma notificação
const deleteNotificacao = async (req, res, next) => {
  try {
    const { id } = req.params;

    // 1. Validate if ID exists and is valid
    if (!id) {
      throw new ErrorHandler(400, "ID da notificação é obrigatório");
    }

    if (isNaN(id) || Number(id) <= 0) {
      throw new ErrorHandler(
        400,
        "ID da notificação deve ser um número válido"
      );
    }

    // 2. Check admin access
    if (!req.user || req.user.Funcao !== "admin") {
      throw new ErrorHandler(
        403,
        "Acesso negado. Apenas administradores podem deletar notificações"
      );
    }

    // 3. Check if notification exists before trying to delete
    const notificacao = await Notificacao.findByPk(id);
    if (!notificacao) {
      throw new ErrorHandler(404, `Notificação com ID ${id} não encontrada`);
    }

    // 4. Try to delete the notification
    try {
      await notificacao.destroy();
    } catch (deleteError) {
      console.error("Erro ao deletar notificação:", deleteError);
      throw new ErrorHandler(500, "Erro ao remover notificação");
    }

    // 5. Return success response with HATEOAS
    return res.status(200).json({
      message: "Notificação eliminada com sucesso",
      links: [
        { rel: "criar-notificacao", href: "/notificacoes", method: "POST" },
        { rel: "listar-notificacoes", href: "/notificacoes", method: "GET" },
      ],
    });
  } catch (err) {
    console.error("Erro em deleteNotificacao:", err);

    if (err instanceof ErrorHandler) {
      return next(err);
    }

    if (err.name === "SequelizeValidationError") {
      return next(new ErrorHandler(400, "Erro de validação dos dados"));
    }

    if (err.name === "SequelizeForeignKeyConstraintError") {
      return next(
        new ErrorHandler(
          400,
          "Erro: A notificação não pode ser removida devido a dependências"
        )
      );
    }

    if (err.name === "SequelizeDatabaseError") {
      return next(new ErrorHandler(500, "Erro de banco de dados"));
    }

    if (err.name === "SequelizeConnectionError") {
      return next(
        new ErrorHandler(503, "Erro de conexão com o banco de dados")
      );
    }

    next(
      new ErrorHandler(500, "Erro interno do servidor ao remover notificação")
    );
  }
};

// Atualizar uma notificação
const updateNotificacao = async (req, res, next) => {
  try {
    const { id } = req.params;

    // 1. Validate if ID exists and is valid
    if (!id) {
      throw new ErrorHandler(400, "ID da notificação é obrigatório");
    }

    if (isNaN(id) || Number(id) <= 0) {
      throw new ErrorHandler(
        400,
        "ID da notificação deve ser um número válido"
      );
    }

    // 2. Check admin access
    if (!req.user || req.user.Funcao !== "admin") {
      throw new ErrorHandler(
        403,
        "Acesso negado. Apenas administradores podem atualizar notificações"
      );
    }

    // 3. Check if notification exists
    const notificacao = await Notificacao.findByPk(id);
    if (!notificacao) {
      throw new ErrorHandler(404, `Notificação com ID ${id} não encontrada`);
    }

    // 4. Validate request body
    const { Mensagem, IdRecipiente } = req.body;
    if (!Mensagem && !IdRecipiente) {
      throw new ErrorHandler(
        400,
        "É necessário fornecer Mensagem ou IdRecipiente para atualização"
      );
    }

    // 5. Validate Mensagem if provided
    if (Mensagem) {
      if (typeof Mensagem !== "string" || Mensagem.trim().length < 1) {
        throw new ErrorHandler(400, "Mensagem deve ser um texto não vazio");
      }

      if (Mensagem.length > 255) {
        throw new ErrorHandler(
          400,
          "Mensagem excede o limite de 255 caracteres"
        );
      }
    }

    // 6. Validate IdRecipiente if provided
    if (IdRecipiente) {
      if (
        !Number.isInteger(Number(IdRecipiente)) ||
        Number(IdRecipiente) <= 0
      ) {
        throw new ErrorHandler(
          400,
          "ID do recipiente deve ser um número válido"
        );
      }

      const recipiente = await db.Utilizador.findByPk(IdRecipiente);
      if (!recipiente) {
        throw new ErrorHandler(404, "Recipiente não encontrado");
      }
    }

    // 7. Update notification
    await notificacao.update({
      Mensagem: Mensagem ? Mensagem.trim() : notificacao.Mensagem,
      IdRecipiente: IdRecipiente || notificacao.IdRecipiente,
    });

    // 8. Return success response with HATEOAS
    return res.status(200).json({
      message: "Notificação atualizada com sucesso",
      data: notificacao,
      links: [
        {
          rel: "self",
          href: `/notificacoes/${notificacao.IdNotificacao}`,
          method: "GET",
        },
        {
          rel: "delete",
          href: `/notificacoes/${notificacao.IdNotificacao}`,
          method: "DELETE",
        },
        { rel: "list", href: "/notificacoes", method: "GET" },
      ],
    });
  } catch (err) {
    console.error("Erro em updateNotificacao:", err);

    if (err instanceof ErrorHandler) {
      return next(err);
    }

    if (err.name === "SequelizeValidationError") {
      return next(new ErrorHandler(400, "Erro de validação dos dados"));
    }

    if (err.name === "SequelizeUniqueConstraintError") {
      return next(new ErrorHandler(409, "Notificação duplicada"));
    }

    if (err.name === "SequelizeForeignKeyConstraintError") {
      return next(
        new ErrorHandler(400, "Referência inválida: recipiente não existe")
      );
    }

    if (err.name === "SequelizeDatabaseError") {
      return next(new ErrorHandler(500, "Erro de banco de dados"));
    }

    if (err.name === "SequelizeConnectionError") {
      return next(
        new ErrorHandler(503, "Erro de conexão com o banco de dados")
      );
    }

    next(
      new ErrorHandler(500, "Erro interno do servidor ao atualizar notificação")
    );
  }
};

// Exibir notificações do usuário autenticado
const getNotificacoesByUserId = async (req, res, next) => {
  try {
    // 1. Get and validate user ID
    const userId = req.query.idUtilizador;

    if (!userId) {
      throw new ErrorHandler(400, "ID do utilizador é obrigatório");
    }

    // 2. Get authenticated user ID and compare
    const authenticatedUserId = req.user.IdUtilizador;
    if (authenticatedUserId != userId) {
      throw new ErrorHandler(
        403,
        "Não tem permissão para ver notificações de outros utilizadores"
      );
    }

    if (!Number.isInteger(Number(userId)) || Number(userId) <= 0) {
      throw new ErrorHandler(400, "ID do utilizador deve ser um número válido");
    }

    // 2. Verify if user exists
    const user = await db.Utilizador.findByPk(userId);
    if (!user) {
      throw new ErrorHandler(404, "Utilizador não encontrado");
    }

    // 3. Check if user is authorized to see these notifications
    if (req.user.IdUtilizador != userId && req.user.Funcao !== "admin") {
      throw new ErrorHandler(
        403,
        "Não tem permissão para ver notificações de outros utilizadores"
      );
    }

    // 4. Fetch user notifications
    const userNotifications = await db.NotificacaoUtilizador.findAll({
      where: { IdUtilizador: userId },
      include: [
        {
          model: db.Notificacao,
          as: "notificacao",
          required: true,
        },
      ],
      order: [["DataRececao", "DESC"]],
    });

    // 5. Format notifications
    const formattedNotificacoes = userNotifications
      .map((nu) => {
        if (!nu.notificacao) {
          console.error(
            `NotificacaoUtilizador ID ${nu.IdNotificacaoUtilizador} não tem notificação associada`
          );
          return null;
        }
        return {
          IdAssociacao: nu.IdNotificacaoUtilizador,
          Mensagem: nu.notificacao.Mensagem,
          DataRececaoPeloUtilizador: nu.DataRececao,
          HoraNotificacaoOriginal: nu.notificacao.HoraNotificacao,
          DataNotificacaoOriginal: nu.notificacao.DataNotificacao,
        };
      })
      .filter((n) => n !== null);

    // 6. Return response
    if (formattedNotificacoes.length === 0) {
      return res.status(204).json({
        message: "Nenhuma notificação encontrada",
        data: [],
      });
    }

    return res.status(200).json({
      data: formattedNotificacoes,
      links: [
        {
          rel: "self",
          href: `/notificacoes/user/by-recipient-id?idUtilizador=${userId}`,
          method: "GET",
        },
      ],
    });
  } catch (err) {
    console.error("Erro em getNotificacoesByUserId:", err);

    if (err instanceof ErrorHandler) {
      return next(err);
    }

    if (err.name === "SequelizeValidationError") {
      return next(new ErrorHandler(400, "Erro de validação dos dados"));
    }

    if (err.name === "SequelizeDatabaseError") {
      return next(new ErrorHandler(500, "Erro de banco de dados"));
    }

    if (err.name === "SequelizeConnectionError") {
      return next(
        new ErrorHandler(503, "Erro de conexão com o banco de dados")
      );
    }

    next(
      new ErrorHandler(500, "Erro interno do servidor ao buscar notificações")
    );
  }
};

const associarNotificacaoAUtilizador = async (req, res, next) => {
  try {
    const { IdNotificacao, IdUtilizador } = req.body;
    if (!IdNotificacao || !IdUtilizador) {
      throw new ErrorHandler(
        400,
        "IdNotificacao e IdUtilizador são obrigatórios"
      );
    }

    const notificacaoExiste = await Notificacao.findByPk(IdNotificacao);
    if (!notificacaoExiste) {
      throw new ErrorHandler(
        404,
        `Notificação com ID ${IdNotificacao} não encontrada.`
      );
    }

    const utilizadorExiste = await db.Utilizador.findByPk(IdUtilizador);
    if (!utilizadorExiste) {
      throw new ErrorHandler(
        404,
        `Utilizador com ID ${IdUtilizador} não encontrado.`
      );
    }

    const associacaoExistente = await db.NotificacaoUtilizador.findOne({
      where: {
        IdNotificacao: IdNotificacao,
        IdUtilizador: IdUtilizador,
      },
    });

    if (associacaoExistente) {
      throw new ErrorHandler(
        409,
        "Esta notificação já está associada a este utilizador"
      );
    }

    const novaAssociacao = await db.NotificacaoUtilizador.create({
      IdNotificacao,
      IdUtilizador,
      DataRececao: new Date(),
    });

    res.status(201).json({
      message: "Notificação associada ao utilizador com sucesso",
      data: novaAssociacao,
    });
  } catch (err) {
    // Check if it's already an ErrorHandler instance
    if (err instanceof ErrorHandler) {
      return next(err);
    }
    // Handle Sequelize validation errors specifically
    if (
      err.name === "SequelizeValidationError" ||
      err.name === "SequelizeUniqueConstraintError"
    ) {
      const messages = err.errors.map((e) => e.message).join(", ");
      return next(new ErrorHandler(400, `Erro de validação: ${messages}`));
    }
    // Handle Sequelize foreign key constraint errors
    if (err.name === "SequelizeForeignKeyConstraintError") {
      return next(
        new ErrorHandler(
          400,
          `Erro de referência a dados inexistentes: ${err.message}`
        )
      );
    }
    // For other generic or database errors
    console.error("Erro não tratado em associarNotificacaoAUtilizador:", err);
    next(
      new ErrorHandler(
        500,
        "Ocorreu um erro interno ao tentar associar a notificação."
      )
    );
  }
};

module.exports = {
  getAllNotificacoes,
  createNotificacao,
  deleteNotificacao,
  updateNotificacao,
  getNotificacoesByUserId,
  associarNotificacaoAUtilizador,
};
