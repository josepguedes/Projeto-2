const db = require("../models/db.js");
const Mensagem = db.Mensagem;
const UtilizadorBloqueio = db.UtilizadorBloqueio; // Adicionar esta linha
const { Op } = require("sequelize");
const { ErrorHandler } = require("../utils/error.js");

const getMensagensChat = async (req, res, next) => {
  try {
    const { idRemetente, idDestinatario, page = 1, limit = 50 } = req.query;

    const authenticatedUserId = req.user.IdUtilizador;

    if (!idRemetente && !idDestinatario) {
      throw new ErrorHandler(
        400,
        "IDs de remetente e destinatário são obrigatórios"
      );
    }

    // Check if user is trying to access their own conversations
    if (authenticatedUserId != idRemetente) {
      return res.status(403).json({
        message:
          "Não tem permissão para aceder a conversas de outros utilizadores",
      });
    }

    if (!idRemetente) {
      throw new ErrorHandler(400, "ID do remetente é obrigatório");
    }

    if (!idDestinatario) {
      throw new ErrorHandler(400, "ID do destinatário é obrigatório");
    }

    // Validar campos obrigatórios
    if (!idRemetente || !idDestinatario) {
      throw new ErrorHandler(
        400,
        "IDs de remetente e destinatário são obrigatórios"
      );
    }

    // Validar se os IDs são números válidos
    if (isNaN(idRemetente) || isNaN(idDestinatario)) {
      throw new ErrorHandler(
        400,
        "IDs de remetente e destinatário devem ser números"
      );
    }

    if (isNaN(idRemetente)) {
      throw new ErrorHandler(400, "ID do remetente deve ser um número válido");
    }

    if (isNaN(idDestinatario)) {
      throw new ErrorHandler(
        400,
        "ID do destinatário deve ser um número válido"
      );
    }

    // Validar se os utilizadores existem
    const [remetente, destinatario] = await Promise.all([
      db.Utilizador.findByPk(idRemetente),
      db.Utilizador.findByPk(idDestinatario),
    ]);

    if (!remetente || !destinatario) {
      throw new ErrorHandler(404, "Remetente ou destinatário não encontrado");
    }

    // Validar página e limite
    if (isNaN(page) || page < 1) {
      throw new ErrorHandler(400, "Página inválida");
    }
    if (isNaN(limit) || limit < 1) {
      throw new ErrorHandler(400, "Limite inválido");
    }

    // Verificar bloqueios
    const bloqueioExistente = await UtilizadorBloqueio.findOne({
      where: {
        [Op.or]: [
          {
            IdBloqueador: idRemetente,
            IdBloqueado: idDestinatario,
          },
          {
            IdBloqueador: idDestinatario,
            IdBloqueado: idRemetente,
          },
        ],
      },
    });

    if (bloqueioExistente) {
      return res.status(403).json({
        message: "Não é possível ver mensagens de utilizadores bloqueados",
        bloqueado: true,
      });
    }

    // Buscar mensagens se não houver bloqueio
    const mensagens = await Mensagem.findAndCountAll({
      where: {
        [Op.or]: [
          {
            IdRemetente: idRemetente,
            IdDestinatario: idDestinatario,
          },
          {
            IdRemetente: idDestinatario,
            IdDestinatario: idRemetente,
          },
        ],
      },
      include: [
        {
          model: db.Utilizador,
          as: "remetente",
          attributes: ["Nome", "ImagemPerfil"],
        },
        {
          model: db.Utilizador,
          as: "destinatario",
          attributes: ["Nome", "ImagemPerfil"],
        },
      ],
      order: [
        ["DataEnvio", "ASC"],
        ["HoraEnvio", "ASC"],
      ],
      limit: +limit,
      offset: (+page - 1) * +limit,
    });

    return res.status(200).json({
      totalPages: Math.ceil(mensagens.count / limit),
      currentPage: +page,
      total: mensagens.count,
      data: mensagens.rows,
    });
  } catch (err) {
    // Log do erro no servidor
    console.error("Erro em getMensagensChat:", err);

    // Se já for um ErrorHandler, passa adiante
    if (err instanceof ErrorHandler) {
      return next(err);
    }

    // Erro genérico para outros casos
    next(new ErrorHandler(500, "Erro interno do servidor ao buscar mensagens"));
  }
};

// Send a new message
const createMensagem = async (req, res, next) => {
  try {
    const { IdRemetente, IdDestinatario, Conteudo } = req.body;

    // Verify authenticated user
    const authenticatedUserId = req.user.IdUtilizador;

    // Check if any required field is missing
    if (!IdRemetente || !IdDestinatario || !Conteudo) {
      throw new ErrorHandler(400, "Todos os campos são obrigatórios");
    }

    // Check if user is trying to send message as someone else
    if (authenticatedUserId != IdRemetente) {
      return res.status(403).json({
        message:
          "Não tem permissão para enviar mensagens como outro utilizador",
      });
    }

    if (!IdRemetente) {
      throw new ErrorHandler(400, "ID do remetente é obrigatório");
    }

    if (!IdDestinatario) {
      throw new ErrorHandler(400, "ID do destinatário é obrigatório");
    }

    if (!Conteudo) {
      throw new ErrorHandler(400, "Conteúdo da mensagem é obrigatório");
    }

    // Validate if IDs are valid numbers
    if (isNaN(IdRemetente)) {
      throw new ErrorHandler(400, "ID do remetente deve ser um número válido");
    }

    if (isNaN(IdDestinatario)) {
      throw new ErrorHandler(
        400,
        "ID do destinatário deve ser um número válido"
      );
    }

    // Validate content length
    if (Conteudo.trim().length === 0) {
      throw new ErrorHandler(400, "Conteúdo da mensagem não pode estar vazio");
    }

    if (Conteudo.length > 255) {
      throw new ErrorHandler(
        400,
        "Conteúdo da mensagem excede o limite de 255 caracteres"
      );
    }

    // Verify if users exist
    const [remetente, destinatario] = await Promise.all([
      db.Utilizador.findByPk(IdRemetente),
      db.Utilizador.findByPk(IdDestinatario),
    ]);

    if (!remetente || !destinatario) {
      throw new ErrorHandler(404, "Remetente ou destinatário não encontrado");
    }

    // Check if users are blocked
    const bloqueio = await UtilizadorBloqueio.findOne({
      where: {
        [Op.or]: [
          { IdBloqueador: IdRemetente, IdBloqueado: IdDestinatario },
          { IdBloqueador: IdDestinatario, IdBloqueado: IdRemetente },
        ],
      },
    });

    if (bloqueio) {
      throw new ErrorHandler(
        403,
        "Não é possível enviar mensagens para utilizadores bloqueados"
      );
    }

    if (!remetente || !destinatario) {
      throw new ErrorHandler(404, "Remetente ou destinatário não encontrado");
    }

    // Verificar se existe bloqueio em qualquer direção
    const bloqueioExistente = await UtilizadorBloqueio.findOne({
      where: {
        [Op.or]: [
          {
            IdBloqueador: IdRemetente,
            IdBloqueado: IdDestinatario,
          },
          {
            IdBloqueador: IdDestinatario,
            IdBloqueado: IdRemetente,
          },
        ],
      },
    });

    if (bloqueioExistente) {
      throw new ErrorHandler(
        403,
        "Não é possível enviar mensagens para utilizadores bloqueados"
      );
    }

    // Validar tamanho da mensagem
    if (Conteudo.length > 255) {
      throw new ErrorHandler(400, "Mensagem excede o limite de 255 caracteres");
    }

    // Criar mensagem com data/hora de Portugal
    const now = new Date();
    const portugalOffset = 60;
    const date = new Date(now.getTime() + portugalOffset * 60000);

    const mensagem = await Mensagem.create({
      IdRemetente,
      IdDestinatario,
      Conteudo,
      DataEnvio: date,
      HoraEnvio: date,
    });

    return res.status(201).json({
      message: "Mensagem enviada com sucesso",
      data: mensagem,
    });
  } catch (err) {
    // Log do erro no servidor
    console.error("Erro em createMensagem:", err);

    // Se já for um ErrorHandler, passa adiante
    if (err instanceof ErrorHandler) {
      return next(err);
    }

    // Erros específicos do Sequelize
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

    if (err.name === "SequelizeForeignKeyConstraintError") {
      return next(
        new ErrorHandler(400, "Erro de referência: usuário não existe")
      );
    }

    // Erro genérico para outros casos
    next(new ErrorHandler(500, "Erro interno do servidor ao enviar mensagem"));
  }
};

// Delete a message
const deleteMensagem = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Get authenticated user ID
    const authenticatedUserId = req.user.IdUtilizador;

    // Validate message ID
    if (!id) {
      throw new ErrorHandler(400, "ID da mensagem é obrigatório");
    }

    // Validate ID format
    if (isNaN(id)) {
      throw new ErrorHandler(400, "ID da mensagem deve ser um número válido");
    }

    // Find message
    const mensagem = await Mensagem.findByPk(id);
    if (!mensagem) {
      throw new ErrorHandler(404, `Mensagem com ID ${id} não encontrada`);
    }

    // Check if user owns the message
    if (authenticatedUserId != mensagem.IdRemetente) {
      return res.status(403).json({
        message:
          "Não tem permissão para apagar mensagens de outros utilizadores",
      });
    }

    // Delete message
    await mensagem.destroy();

    return res.status(200).json({
      message: "Mensagem apagada com sucesso",
    });
  } catch (err) {
    console.error("Erro em deleteMensagem:", err);

    if (err instanceof ErrorHandler) {
      return next(err);
    }

    next(new ErrorHandler(500, "Erro interno do servidor ao deletar mensagem"));
  }
};

const getUserConversations = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const authenticatedUserId = req.user.IdUtilizador;

    // Validar ID do utilizador
    if (!userId) {
      throw new ErrorHandler(400, "ID do utilizador é obrigatório");
    }

    // Check if user is trying to access their own conversations
    if (authenticatedUserId != userId) {
      return res.status(403).json({
        message:
          "Não tem permissão para aceder a conversas de outros utilizadores",
      });
    }

    // Validar se ID é número válido
    if (isNaN(userId)) {
      throw new ErrorHandler(400, "ID do utilizador deve ser um número");
    }

    // Verificar se utilizador existe
    const utilizador = await db.Utilizador.findByPk(userId);
    if (!utilizador) {
      throw new ErrorHandler(404, "Utilizador não encontrado");
    }

    // Buscar todas as mensagens onde o usuário é remetente ou destinatário
    const conversations = await Mensagem.findAll({
      where: {
        [Op.or]: [{ IdRemetente: userId }, { IdDestinatario: userId }],
      },
      include: [
        {
          model: db.Utilizador,
          as: "remetente",
          attributes: ["IdUtilizador", "Nome", "ImagemPerfil"],
        },
        {
          model: db.Utilizador,
          as: "destinatario",
          attributes: ["IdUtilizador", "Nome", "ImagemPerfil"],
        },
      ],
      order: [
        ["DataEnvio", "DESC"],
        ["HoraEnvio", "DESC"],
      ],
    });

    // Processar e agrupar conversas
    const processedConversations = conversations.reduce((acc, message) => {
      try {
        const otherUser =
          message.IdRemetente == userId
            ? message.destinatario
            : message.remetente;

        if (!otherUser) {
          console.error("Usuário da conversa não encontrado:", message);
          return acc;
        }

        const otherUserId = otherUser.IdUtilizador;

        if (!acc[otherUserId]) {
          const timeDiff = new Date() - new Date(message.DataEnvio);
          const minutes = Math.floor(timeDiff / 60000);
          const hours = Math.floor(minutes / 60);
          const days = Math.floor(hours / 24);

          let timeAgo;
          if (days > 0) {
            timeAgo = `${days} dia${days > 1 ? "s" : ""} atrás`;
          } else if (hours > 0) {
            timeAgo = `${hours} hora${hours > 1 ? "s" : ""} atrás`;
          } else if (minutes > 0) {
            timeAgo = `${minutes} minuto${minutes > 1 ? "s" : ""} atrás`;
          } else {
            timeAgo = "agora mesmo";
          }

          acc[otherUserId] = {
            otherUser: {
              id: otherUser.IdUtilizador,
              nome: otherUser.Nome,
              imagemPerfil: otherUser.ImagemPerfil,
            },
            ultimaMensagem: {
              conteudo: message.Conteudo,
              dataEnvio: message.DataEnvio,
              horaEnvio: message.HoraEnvio,
              timeAgo: timeAgo,
            },
          };
        }
        return acc;
      } catch (error) {
        console.error("Erro ao processar mensagem:", error);
        return acc;
      }
    }, {});

    const conversationsList = Object.values(processedConversations);

    return res.status(200).json({
      data: conversationsList,
    });
  } catch (err) {
    // Log do erro no servidor
    console.error("Erro em getUserConversations:", err);

    // Se já for um ErrorHandler, passa adiante
    if (err instanceof ErrorHandler) {
      return next(err);
    }

    // Erros específicos do Sequelize
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

    // Erro genérico para outros casos
    next(new ErrorHandler(500, "Erro interno do servidor ao buscar conversas"));
  }
};

module.exports = {
  getMensagensChat,
  createMensagem,
  deleteMensagem,
  getUserConversations,
};
