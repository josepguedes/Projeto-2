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

    // Aplicar filtros
    if (idBloqueador) {
      where.IdBloqueador = idBloqueador;
    }
    if (idBloqueado) {
      where.IdBloqueado = idBloqueado;
    }

    // Validar página e limite
    if (isNaN(page) || page < 1) {
      throw new ErrorHandler(400, "Página inválida");
    }
    if (isNaN(limit) || limit < 1) {
      throw new ErrorHandler(400, "Limite inválido");
    }

    // Buscar os bloqueios agora ordenados por DataBloqueio
    const bloqueios = await UtilizadorBloqueio.findAndCountAll({
      where,
      limit: +limit,
      offset: (+page - 1) * +limit,
      order: [["DataBloqueio", "DESC"]]
    });

    // Vamos carregar as informações de usuário manualmente
    for (const bloqueio of bloqueios.rows) {
      const bloqueador = await Utilizador.findByPk(bloqueio.IdBloqueador, {
        attributes: ["Nome", "ImagemPerfil"],
      });

      const bloqueado = await Utilizador.findByPk(bloqueio.IdBloqueado, {
        attributes: ["Nome", "ImagemPerfil", "Email"],
      });

      // Adicionar as informações ao objeto do bloqueio
      bloqueio.dataValues.bloqueador = bloqueador;
      bloqueio.dataValues.bloqueado = bloqueado;
    }

    // Adicionar links HATEOAS
    bloqueios.rows.forEach((bloqueio) => {
      bloqueio.links = [
        {
          rel: "self",
          href: `/bloqueios/utilizador/${bloqueio.IdBloqueio}`,
          method: "GET",
        },
        {
          rel: "delete",
          href: `/bloqueios/utilizador/${bloqueio.IdBloqueio}`,
          method: "DELETE",
        },
      ];
    });

    return res.status(200).json({
      totalPages: Math.ceil(bloqueios.count / limit),
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
                href: `/bloqueios/utilizador?limit=${limit}&page=${page - 1}`,
                method: "GET",
              },
            ]
          : []),
        ...(bloqueios.count > page * limit
          ? [
              {
                rel: "proxima-pagina",
                href: `/bloqueios/utilizador?limit=${limit}&page=${+page + 1}`,
                method: "GET",
              },
            ]
          : []),
      ],
    });
  } catch (err) {
    next(err);
  }
};

// Verificar se um utilizador está bloqueado por outro
const checkUtilizadorBloqueio = async (req, res, next) => {
  try {
    const { idBloqueador, idBloqueado } = req.query;

    if (!idBloqueador || !idBloqueado) {
      throw new ErrorHandler(
        400,
        "IDs de bloqueador e bloqueado são obrigatórios"
      );
    }

    const bloqueio = await UtilizadorBloqueio.findOne({
      where: {
        IdBloqueador: idBloqueador,
        IdBloqueado: idBloqueado,
      },
    });

    return res.status(200).json({
      bloqueado: !!bloqueio,
      data: bloqueio,
    });
  } catch (err) {
    next(err);
  }
};

// Criar um novo bloqueio entre utilizadores
const createUtilizadorBloqueio = async (req, res, next) => {
  try {
    const { IdBloqueador, IdBloqueado } = req.body;

    // Validar dados obrigatórios
    if (!IdBloqueador || !IdBloqueado) {
      throw new ErrorHandler(
        400,
        "IDs de bloqueador e bloqueado são obrigatórios"
      );
    }

    // Verificar se usuários existem
    const bloqueador = await Utilizador.findByPk(IdBloqueador);
    const bloqueado = await Utilizador.findByPk(IdBloqueado);

    if (!bloqueador || !bloqueado) {
      throw new ErrorHandler(404, "Utilizador não encontrado");
    }

    // Verificar se já existe bloqueio
    const bloqueioExistente = await UtilizadorBloqueio.findOne({
      where: {
        IdBloqueador,
        IdBloqueado,
      },
    });

    if (bloqueioExistente) {
      throw new ErrorHandler(409, "Este utilizador já está bloqueado");
    }

    // Criar bloqueio com a nova coluna DataBloqueio
    const novoBloqueio = await UtilizadorBloqueio.create({
      IdBloqueador,
      IdBloqueado,
      DataBloqueio: new Date()
    });

    return res.status(201).json({
      message: "Utilizador bloqueado com sucesso",
      data: novoBloqueio,
      links: [
        {
          rel: "self",
          href: `/bloqueios/utilizador/${novoBloqueio.IdBloqueio}`,
          method: "GET",
        },
        {
          rel: "delete",
          href: `/bloqueios/utilizador/${novoBloqueio.IdBloqueio}`,
          method: "DELETE",
        },
      ],
    });
  } catch (err) {
    next(err);
  }
};

// Remover um bloqueio entre utilizadores
const deleteUtilizadorBloqueio = async (req, res, next) => {
  try {
    const { id } = req.params;

    const bloqueio = await UtilizadorBloqueio.findByPk(id);
    if (!bloqueio) {
      throw new ErrorHandler(404, "Bloqueio não encontrado");
    }

    await bloqueio.destroy();

    return res.status(200).json({
      message: "Bloqueio removido com sucesso",
      links: [
        {
          rel: "criar-bloqueio",
          href: `/bloqueios/utilizador`,
          method: "POST",
        },
        {
          rel: "listar-bloqueios",
          href: `/bloqueios/utilizador`,
          method: "GET",
        },
      ],
    });
  } catch (err) {
    next(err);
  }
};

// ================ BLOQUEIOS ADMINISTRATIVOS ================

// Bloquear utilizador por administrador
const createAdminBloqueio = async (req, res, next) => {
    try {
        const { IdBloqueado, DataFimBloqueio } = req.body;

        // Validar dados obrigatórios
        if (!IdBloqueado) {
            throw new ErrorHandler(400, "ID do utilizador é obrigatório");
        }

        // Verificar se utilizador existe
        const utilizador = await db.Utilizador.findByPk(IdBloqueado);
        if (!utilizador) {
            throw new ErrorHandler(404, "Utilizador não encontrado");
        }

        // Verificar se já existe bloqueio ativo
        const bloqueioExistente = await AdminBloqueio.findOne({
            where: {
                IdBloqueado,
                [Op.or]: [
                    { DataFimBloqueio: null },
                    { DataFimBloqueio: { [Op.gt]: new Date() } }
                ]
            }
        });

        if (bloqueioExistente) {
            throw new ErrorHandler(409, "Este utilizador já está bloqueado por um administrador");
        }

        // Criar o bloqueio
        const novoBloqueio = await AdminBloqueio.create({
            IdBloqueado,
            DataBloqueio: new Date(),
            DataFimBloqueio: DataFimBloqueio || null
        });

        return res.status(201).json({
            message: "Utilizador bloqueado com sucesso",
            data: novoBloqueio
        });

    } catch (err) {
        next(err);
    }
};

// Remover bloqueio administrativo
const deleteAdminBloqueio = async (req, res, next) => {
  try {
    const { id } = req.params;

    const bloqueio = await AdminBloqueio.findByPk(id);
    if (!bloqueio) {
      throw new ErrorHandler(404, "Bloqueio não encontrado");
    }

    // Verificar se o bloqueio está ativo
    await bloqueio.destroy();

    return res.status(200).json({
      message: "Bloqueio removido com sucesso",
      links: [
        { rel: "listar-bloqueios", href: `/bloqueios/admin`, method: "GET" }
      ]
    });
  } catch (err) {
    next(err);
  }
};

// Listar todos os bloqueios administrativos
const getAllAdminBloqueios = async (req, res, next) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        
        const bloqueios = await AdminBloqueio.findAndCountAll({
            include: [{
                model: db.Utilizador,
                as: 'bloqueado',
                attributes: ['Nome', 'ImagemPerfil', 'Email'],
                required: true
            }],
            order: [['DataBloqueio', 'DESC']],
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit)
        });

        return res.status(200).json({
            data: bloqueios.rows,
            totalPages: Math.ceil(bloqueios.count / parseInt(limit)),
            currentPage: parseInt(page),
            total: bloqueios.count
        });

    } catch (err) {
        console.error('Erro ao buscar bloqueios:', err);
        next(err);
    }
};

// Obter detalhes de um bloqueio administrativo específico
const getAdminBloqueioById = async (req, res, next) => {
  try {
    const { id } = req.params;


    const bloqueio = await AdminBloqueio.findByPk(id, {
      include: [

        {
          model: db.Utilizador,
          as: "utilizadorBloqueado",
          attributes: ["Nome", "ImagemPerfil", "Email"],
          required: false,
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

const checkAdminBloqueio = async (req, res, next) => {
    try {
        const { id } = req.params;

        const bloqueio = await AdminBloqueio.findOne({
            where: {
                IdBloqueado: id,
                [Op.or]: [
                    { DataFimBloqueio: null },
                    { DataFimBloqueio: { [Op.gt]: new Date() } }
                ]
            }
        });

        return res.status(200).json({
            bloqueio: bloqueio,
            bloqueado: !!bloqueio
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
  getAllAdminBloqueios,
  getAdminBloqueioById,
  checkAdminBloqueio
};
