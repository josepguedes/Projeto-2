const db = require("../models/db.js");
const UtilizadorBloqueio = db.UtilizadorBloqueio;
const AdminBloqueio = db.AdminBloqueio;
const Utilizador = db.Utilizador;
const { Op } = require("sequelize");
const { ErrorHandler } = require("../utils/error.js");

// ================ BLOQUEIOS ENTRE UTILIZADORES ================

// Listar todos os bloqueios entre utilizadores com paginação e filtros
const getAllUtilizadorBloqueios = async (req, res, next) => {
  try {
    const { idBloqueador, idBloqueado, page = 1, limit = 10 } = req.query;
    const where = {};

    // 1. Validate pagination parameters
    if (!Number.isInteger(Number(page)) || Number(page) < 1) {
      throw new ErrorHandler(400, "Página deve ser um número inteiro positivo");
    }

    if (
      !Number.isInteger(Number(limit)) ||
      Number(limit) < 1 ||
      Number(limit) > 100
    ) {
      throw new ErrorHandler(400, "Limite deve ser um número entre 1 e 100");
    }

    // 2. Validate IDs if provided
    if (idBloqueador) {
      if (
        !Number.isInteger(Number(idBloqueador)) ||
        Number(idBloqueador) <= 0
      ) {
        throw new ErrorHandler(
          400,
          "ID do bloqueador deve ser um número válido"
        );
      }
      where.IdBloqueador = idBloqueador;

      // Check if bloqueador exists
      const bloqueador = await Utilizador.findByPk(idBloqueador);
      if (!bloqueador) {
        throw new ErrorHandler(404, "Utilizador bloqueador não encontrado");
      }
    }

    if (idBloqueado) {
      if (!Number.isInteger(Number(idBloqueado)) || Number(idBloqueado) <= 0) {
        throw new ErrorHandler(
          400,
          "ID do bloqueado deve ser um número válido"
        );
      }
      where.IdBloqueado = idBloqueado;

      // Check if bloqueado exists
      const bloqueado = await Utilizador.findByPk(idBloqueado);
      if (!bloqueado) {
        throw new ErrorHandler(404, "Utilizador bloqueado não encontrado");
      }
    }

    // 3. Fetch blocks with pagination and ordering
    const bloqueios = await UtilizadorBloqueio.findAndCountAll({
      where,
      limit: +limit,
      offset: (+page - 1) * +limit,
      order: [["DataBloqueio", "DESC"]],
      include: [
        {
          model: db.Utilizador,
          as: "bloqueador",
          attributes: ["Nome", "ImagemPerfil"],
          required: true,
        },
        {
          model: db.Utilizador,
          as: "bloqueado",
          attributes: ["Nome", "ImagemPerfil", "Email"],
          required: true,
        },
      ],
    });

    // 4. Check if any blocks were found
    if (bloqueios.count === 0) {
      return res.status(204).json({
        message: "Nenhum bloqueio encontrado",
        totalPages: 0,
        currentPage: +page,
        total: 0,
        data: [],
      });
    }

    // 5. Check if requested page exists
    const totalPages = Math.ceil(bloqueios.count / limit);
    if (page > totalPages) {
      throw new ErrorHandler(
        404,
        `Página ${page} não existe. Total de páginas: ${totalPages}`
      );
    }

    // 6. Add HATEOAS links and return response
    return res.status(200).json({
      totalPages,
      currentPage: +page,
      total: bloqueios.count,
      data: bloqueios.rows,
      links: [
        {
          rel: "criar-bloqueio",
          href: `/bloqueios/utilizador`,
          method: "POST",
        },
        ...(page > 1
          ? [
            {
              rel: "pagina-anterior",
              href: `/bloqueios/utilizador?limit=${limit}&page=${page - 1}${idBloqueador ? `&idBloqueador=${idBloqueador}` : ""
                }${idBloqueado ? `&idBloqueado=${idBloqueado}` : ""}`,
              method: "GET",
            },
          ]
          : []),
        ...(bloqueios.count > page * limit
          ? [
            {
              rel: "proxima-pagina",
              href: `/bloqueios/utilizador?limit=${limit}&page=${+page + 1}${idBloqueador ? `&idBloqueador=${idBloqueador}` : ""
                }${idBloqueado ? `&idBloqueado=${idBloqueado}` : ""}`,
              method: "GET",
            },
          ]
          : []),
      ],
    });
  } catch (err) {
    console.error("Erro em getAllUtilizadorBloqueios:", err);

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

    next(new ErrorHandler(500, "Erro interno do servidor ao buscar bloqueios"));
  }
};

// Verificar se um utilizador está bloqueado por outro
const checkUtilizadorBloqueio = async (req, res, next) => {
  try {
    const { idBloqueador, idBloqueado } = req.query;

    // 1. Validate required parameters
    if (!idBloqueador || !idBloqueado) {
      throw new ErrorHandler(
        400,
        "IDs de bloqueador e bloqueado são obrigatórios"
      );
    }

    // 2. Validate ID formats
    if (!Number.isInteger(Number(idBloqueador)) || Number(idBloqueador) <= 0) {
      throw new ErrorHandler(400, "ID do bloqueador deve ser um número válido");
    }

    if (!Number.isInteger(Number(idBloqueado)) || Number(idBloqueado) <= 0) {
      throw new ErrorHandler(400, "ID do bloqueado deve ser um número válido");
    }

    // 3. Check if users exist
    const [bloqueador, bloqueado] = await Promise.all([
      Utilizador.findByPk(idBloqueador),
      Utilizador.findByPk(idBloqueado),
    ]);

    if (!bloqueador) {
      throw new ErrorHandler(404, "Utilizador bloqueador não encontrado");
    }

    if (!bloqueado) {
      throw new ErrorHandler(404, "Utilizador bloqueado não encontrado");
    }

    // 4. Check for active block
    const bloqueio = await UtilizadorBloqueio.findOne({
      where: {
        IdBloqueador: idBloqueador,
        IdBloqueado: idBloqueado,
      },
      include: [
        {
          model: db.Utilizador,
          as: "bloqueado",
          attributes: ["Nome", "ImagemPerfil"],
          required: true,
        },
      ],
    });

    // 5. Return response
    return res.status(200).json({
      bloqueado: !!bloqueio,
      data: bloqueio,
      message: bloqueio
        ? "Utilizador está bloqueado"
        : "Utilizador não está bloqueado",
    });
  } catch (err) {
    console.error("Erro em checkUtilizadorBloqueio:", err);

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
      new ErrorHandler(500, "Erro interno do servidor ao verificar bloqueio")
    );
  }
};

// Criar um novo bloqueio entre utilizadores
const createUtilizadorBloqueio = async (req, res, next) => {
  try {
    const { IdBloqueador, IdBloqueado } = req.body;

    if (req.user.IdUtilizador != IdBloqueador) {
      return res.status(403).json({
        message:
          "Não tem permissão para criar bloqueios em nome de outros utilizadores",
      });
    }

    // 1. Validate required fields
    if (!IdBloqueador || !IdBloqueado) {
      throw new ErrorHandler(
        400,
        "IDs de bloqueador e bloqueado são obrigatórios"
      );
    }

    // 2. Validate ID formats
    if (!Number.isInteger(Number(IdBloqueador)) || Number(IdBloqueador) <= 0) {
      throw new ErrorHandler(400, "ID do bloqueador deve ser um número válido");
    }

    if (!Number.isInteger(Number(IdBloqueado)) || Number(IdBloqueado) <= 0) {
      throw new ErrorHandler(400, "ID do bloqueado deve ser um número válido");
    }

    // 3. Check if users exist
    const [bloqueador, bloqueado] = await Promise.all([
      Utilizador.findByPk(IdBloqueador),
      Utilizador.findByPk(IdBloqueado),
    ]);

    if (!bloqueador) {
      throw new ErrorHandler(404, "Utilizador bloqueador não encontrado");
    }

    if (!bloqueado) {
      throw new ErrorHandler(404, "Utilizador bloqueado não encontrado");
    }

    // 4. Check if trying to block themselves
    if (IdBloqueador === IdBloqueado) {
      throw new ErrorHandler(400, "Não é possível bloquear a si mesmo");
    }

    // 5. Check if block already exists
    const bloqueioExistente = await UtilizadorBloqueio.findOne({
      where: {
        IdBloqueador,
        IdBloqueado,
      },
    });

    if (bloqueioExistente) {
      throw new ErrorHandler(409, "Este utilizador já está bloqueado");
    }

    // 6. Create block
    const novoBloqueio = await UtilizadorBloqueio.create({
      IdBloqueador,
      IdBloqueado,
      DataBloqueio: new Date(),
    });

    // 7. Return success response with HATEOAS
    return res.status(201).json({
      message: "Utilizador bloqueado com sucesso",
      data: novoBloqueio,
      links: [
        {
          rel: "self",
          href: `/bloqueios/utilizador/${novoBloqueio.IdUtilizadoresBloqueados}`,
          method: "GET",
        },
        {
          rel: "delete",
          href: `/bloqueios/utilizador/${novoBloqueio.IdUtilizadoresBloqueados}`,
          method: "DELETE",
        },
        {
          rel: "listar-bloqueios",
          href: `/bloqueios/utilizador?idBloqueador=${IdBloqueador}`,
          method: "GET",
        },
      ],
    });
  } catch (err) {
    console.error("Erro em createUtilizadorBloqueio:", err);

    if (err instanceof ErrorHandler) {
      return next(err);
    }

    if (err.name === "SequelizeValidationError") {
      return next(new ErrorHandler(400, "Erro de validação dos dados"));
    }

    if (err.name === "SequelizeUniqueConstraintError") {
      return next(new ErrorHandler(409, "Bloqueio duplicado"));
    }

    if (err.name === "SequelizeForeignKeyConstraintError") {
      return next(
        new ErrorHandler(400, "Referência inválida: utilizador não existe")
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

    next(new ErrorHandler(500, "Erro interno do servidor ao criar bloqueio"));
  }
};

// Remover um bloqueio entre utilizadores
const deleteUtilizadorBloqueio = async (req, res, next) => {
  try {
    const { id } = req.params;

    // 1. Validate if ID exists and is valid
    if (!id) {
      throw new ErrorHandler(400, "ID do bloqueio é obrigatório");
    }

    if (isNaN(id) || Number(id) <= 0) {
      throw new ErrorHandler(400, "ID do bloqueio deve ser um número válido");
    }

    // 2. Find block
    const bloqueio = await UtilizadorBloqueio.findByPk(id);
    if (!bloqueio) {
      throw new ErrorHandler(404, "Bloqueio não encontrado");
    }

    // 3. Check if user owns the block
    if (req.user.IdUtilizador != bloqueio.IdBloqueador) {
      return res.status(403).json({
        message: "Não tem permissão para remover bloqueios de outros utilizadores"
      });
    }

    // 4. Delete block
    try {
      await bloqueio.destroy();
    } catch (deleteError) {
      console.error("Erro ao deletar bloqueio:", deleteError);
      throw new ErrorHandler(500, "Erro ao remover bloqueio");
    }

    // 5. Return success response with HATEOAS
    return res.status(200).json({
      message: "Bloqueio removido com sucesso",
      links: [
        {
          rel: "criar-bloqueio",
          href: `/bloqueios/utilizador`,
          method: "POST"
        },
        {
          rel: "listar-bloqueios",
          href: `/bloqueios/utilizador?idBloqueador=${req.user.IdUtilizador}`,
          method: "GET"
        }
      ]
    });

  } catch (err) {
    console.error("Erro em deleteUtilizadorBloqueio:", err);

    if (err instanceof ErrorHandler) {
      return next(err);
    }

    if (err.name === 'SequelizeValidationError') {
      return next(new ErrorHandler(400, "Erro de validação dos dados"));
    }

    if (err.name === 'SequelizeForeignKeyConstraintError') {
      return next(new ErrorHandler(400, "Erro: O bloqueio não pode ser removido devido a dependências"));
    }

    if (err.name === 'SequelizeDatabaseError') {
      return next(new ErrorHandler(500, "Erro de banco de dados"));
    }

    if (err.name === 'SequelizeConnectionError') {
      return next(new ErrorHandler(503, "Erro de conexão com o banco de dados"));
    }

    next(new ErrorHandler(500, "Erro interno do servidor ao remover bloqueio"));
  }
};

// ================ BLOQUEIOS ADMINISTRATIVOS ================

const checkAdminBloqueio = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      throw new ErrorHandler(400, "ID do utilizador é obrigatório");
    }

    if (isNaN(id) || Number(id) <= 0) {
      throw new ErrorHandler(400, "ID do utilizador deve ser um número válido");
    }

    const utilizador = await Utilizador.findByPk(id);
    if (!utilizador) {
      throw new ErrorHandler(404, "Utilizador não encontrado");
    }

    const bloqueio = await AdminBloqueio.findOne({
      where: {
        IdBloqueado: id
      }
    });

    // Verifica se existe bloqueio e se tem data de fim
    if (bloqueio && bloqueio.DataFimBloqueio) {
      const agora = new Date();
      const dataFim = new Date(bloqueio.DataFimBloqueio);

      // Se a data de fim já passou, remove o bloqueio
      if (dataFim <= agora) {
        await AdminBloqueio.destroy({
          where: { IdAdminBloqueados: bloqueio.IdAdminBloqueados }
        });

        return res.status(200).json({
          bloqueio: null,
          bloqueado: false,
          message: "Bloqueio expirado e removido automaticamente"
        });
      }
    }

    return res.status(200).json({
      bloqueio: bloqueio,
      bloqueado: !!bloqueio,
      message: bloqueio ?
        (bloqueio.DataFimBloqueio ?
          `Utilizador bloqueado até ${new Date(bloqueio.DataFimBloqueio).toLocaleDateString('pt-PT')}` :
          "Utilizador bloqueado permanentemente") :
        "Utilizador não está bloqueado"
    });

  } catch (err) {
    console.error("Erro em checkAdminBloqueio:", err);

    if (err instanceof ErrorHandler) {
      return next(err);
    }

    if (err.name === "SequelizeConnectionError") {
      return next(new ErrorHandler(503, "Erro de conexão com o banco de dados"));
    }

    if (err.name === "SequelizeDatabaseError") {
      return next(new ErrorHandler(500, "Erro de banco de dados"));
    }

    next(new ErrorHandler(500, "Erro interno do servidor ao verificar bloqueio"));
  }
};

// Bloquear utilizador por administrador
const createAdminBloqueio = async (req, res, next) => {
  try {
    const { IdBloqueado, DataFimBloqueio } = req.body;

    // 1. Validate required data
    if (!IdBloqueado) {
      throw new ErrorHandler(400, "ID do utilizador é obrigatório");
    }

    // 2. Validate ID format
    if (isNaN(IdBloqueado) || Number(IdBloqueado) <= 0) {
      throw new ErrorHandler(400, "ID do utilizador deve ser um número válido");
    }

    // 3. Validate end date format if provided
    if (DataFimBloqueio) {
      if (!Date.parse(DataFimBloqueio)) {
        throw new ErrorHandler(400, "Data de fim do bloqueio inválida");
      }
      if (new Date(DataFimBloqueio) <= new Date()) {
        throw new ErrorHandler(400, "Data de fim do bloqueio deve ser futura");
      }
    }

    // 4. Check if user exists
    const utilizador = await db.Utilizador.findByPk(IdBloqueado);
    if (!utilizador) {
      throw new ErrorHandler(404, "Utilizador não encontrado");
    }

    // 5. Check if user is admin
    if (utilizador.Funcao === "admin") {
      throw new ErrorHandler(403, "Não é possível bloquear um administrador");
    }

    // 6. Check if user is already blocked
    const bloqueioExistente = await AdminBloqueio.findOne({
      where: {
        IdBloqueado,
        [Op.or]: [
          { DataFimBloqueio: null },
          { DataFimBloqueio: { [Op.gt]: new Date() } },
        ],
      },
    });

    if (bloqueioExistente) {
      throw new ErrorHandler(
        409,
        "Este utilizador já está bloqueado por um administrador"
      );
    }

    // 7. Create block
    const novoBloqueio = await AdminBloqueio.create({
      IdBloqueado,
      DataBloqueio: new Date(),
      DataFimBloqueio: DataFimBloqueio || null,
    });

    // 8. Return success response
    return res.status(201).json({
      message: "Utilizador bloqueado com sucesso",
      data: novoBloqueio,
      links: [
        {
          rel: "check-block",
          href: `/bloqueios/admin/check/${IdBloqueado}`,
          method: "GET",
        },
        {
          rel: "remove-block",
          href: `/bloqueios/admin/${novoBloqueio.IdAdminBloqueados}`,
          method: "DELETE",
        },
      ],
    });
  } catch (err) {
    console.error("Erro em createAdminBloqueio:", err);

    if (err instanceof ErrorHandler) {
      return next(err);
    }

    if (err.name === "SequelizeValidationError") {
      return next(new ErrorHandler(400, "Erro de validação dos dados"));
    }

    if (err.name === "SequelizeUniqueConstraintError") {
      return next(new ErrorHandler(409, "Bloqueio duplicado"));
    }

    if (err.name === "SequelizeDatabaseError") {
      return next(new ErrorHandler(500, "Erro de banco de dados"));
    }

    if (err.name === "SequelizeConnectionError") {
      return next(
        new ErrorHandler(503, "Erro de conexão com o banco de dados")
      );
    }

    next(new ErrorHandler(500, "Erro interno do servidor ao criar bloqueio"));
  }
};

// Remover bloqueio administrativo
const deleteAdminBloqueio = async (req, res, next) => {
  try {
    const { id } = req.params;

    // 1. Validate if ID exists and is valid
    if (!id) {
      throw new ErrorHandler(400, "ID do bloqueio é obrigatório");
    }

    if (isNaN(id) || Number(id) <= 0) {
      throw new ErrorHandler(400, "ID do bloqueio deve ser um número válido");
    }

    // 2. Check if block exists
    const bloqueio = await AdminBloqueio.findByPk(id);
    if (!bloqueio) {
      throw new ErrorHandler(404, "Bloqueio não encontrado");
    }

    // 3. Delete block
    try {
      await bloqueio.destroy();
    } catch (deleteError) {
      console.error("Erro ao deletar bloqueio:", deleteError);
      throw new ErrorHandler(500, "Erro ao remover bloqueio");
    }

    // 4. Return success response
    return res.status(200).json({
      message: "Bloqueio removido com sucesso",
      links: [
        {
          rel: "listar-bloqueios",
          href: `/bloqueios/admin`,
          method: "GET",
        },
        {
          rel: "criar-bloqueio",
          href: `/bloqueios/admin`,
          method: "POST",
        },
      ],
    });
  } catch (err) {
    console.error("Erro em deleteAdminBloqueio:", err);

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
          "Erro: O bloqueio não pode ser removido devido a dependências"
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

    next(new ErrorHandler(500, "Erro interno do servidor ao remover bloqueio"));
  }
};

// Listar todos os bloqueios administrativos (não está a ser usada)
const getAllAdminBloqueios = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const bloqueios = await AdminBloqueio.findAndCountAll({
      include: [
        {
          model: db.Utilizador,
          as: "bloqueado",
          attributes: ["Nome", "ImagemPerfil", "Email"],
          required: true,
        },
      ],
      order: [["DataBloqueio", "DESC"]],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
    });

    return res.status(200).json({
      data: bloqueios.rows,
      totalPages: Math.ceil(bloqueios.count / parseInt(limit)),
      currentPage: parseInt(page),
      total: bloqueios.count,
    });
  } catch (err) {
    console.error("Erro ao buscar bloqueios:", err);
    next(err);
  }
};

// Obter detalhes de um bloqueio administrativo específico (não está a ser usada)
const getAdminBloqueioById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const bloqueio = await AdminBloqueio.findByPk(id, {
      include: [
        {
          model: db.Utilizador,
          as: "utilizadorBloqueado",
          attributes: ["Nome", "ImagemPerfil", "Email"],
          required: false, // Tornando o join opcional para debugging
        },
      ],
    });

    if (!bloqueio) {
      throw new ErrorHandler(404, "Bloqueio administrativo não encontrado");
    }

    // Verificar se o bloqueio está ativo usando DataFimBloqueio
    const bloqueioAtivo =
      !bloqueio.DataFimBloqueio ||
      new Date(bloqueio.DataFimBloqueio) > new Date();

    return res.status(200).json({
      data: bloqueio,
      links: [
        {
          rel: "self",
          href: `/bloqueios/admin/${bloqueio.IdAdminBloqueados}`,
          method: "GET",
        },
        {
          rel: "delete",
          href: `/bloqueios/admin/${bloqueio.IdAdminBloqueados}`,
          method: "DELETE",
        },
        { rel: "listar-bloqueios", href: `/bloqueios/admin`, method: "GET" },
      ],
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  // Bloqueios entre utilizadores
  getAllUtilizadorBloqueios,
  checkUtilizadorBloqueio,
  createUtilizadorBloqueio,
  deleteUtilizadorBloqueio,

  // Bloqueios administrativos
  createAdminBloqueio,
  deleteAdminBloqueio,
  checkAdminBloqueio,

  getAllAdminBloqueios,
  getAdminBloqueioById,
};
