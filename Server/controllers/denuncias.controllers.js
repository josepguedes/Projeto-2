const db = require("../models/db.js");
const Denuncia = db.Denuncia;
const { Op } = require("sequelize");
const { ErrorHandler } = require("../utils/error.js");

//Listar todas as denúncias com paginação e filtros
const getAllDenuncias = async (req, res, next) => {
  try {
    const { idDenuncia, page = 1, limit = 10 } = req.query;
    const where = {};

    // Validate idDenuncia format if provided
    if (idDenuncia) {
      if (!Number.isInteger(Number(idDenuncia)) || Number(idDenuncia) <= 0) {
        throw new ErrorHandler(
          400,
          "ID da denúncia deve ser um número inteiro positivo"
        );
      }
      where.IdDenuncia = { [Op.like]: `%${idDenuncia}%` };
    }

    // Validate page number
    if (isNaN(page) || page < 1) {
      throw new ErrorHandler(
        400,
        "Número de página inválido. Deve ser um número positivo"
      );
    }

    // Validate limit number
    if (isNaN(limit) || limit < 1 || limit > 100) {
      throw new ErrorHandler(
        400,
        "Limite inválido. Deve ser um número entre 1 e 100"
      );
    }

    // Try to fetch denuncias
    const denuncias = await Denuncia.findAndCountAll({
      where,
      order: [["DataDenuncia", "DESC"]],
      limit: +limit,
      offset: (+page - 1) * +limit,
    }).catch((error) => {
      throw new ErrorHandler(500, "Erro ao buscar denúncias no banco de dados");
    });

    // Check if there are any denuncias
    if (denuncias.count === 0) {
      return res.status(204).json({
        message: "Nenhuma denúncia encontrada",
        totalPages: 0,
        currentPage: +page,
        total: 0,
        data: [],
      });
    }

    // Validate if requested page exists
    const totalPages = Math.ceil(denuncias.count / limit);
    if (page > totalPages) {
      throw new ErrorHandler(
        404,
        `Página ${page} não existe. Total de páginas: ${totalPages}`
      );
    }

    // Add HATEOAS links
    try {
      denuncias.rows.forEach((denuncia) => {
        denuncia.links = [
          {
            rel: "self",
            href: `/denuncias/${denuncia.IdDenuncia}`,
            method: "GET",
          },
          {
            rel: "delete",
            href: `/denuncias/${denuncia.IdDenuncia}`,
            method: "DELETE",
          },
          {
            rel: "modify",
            href: `/denuncias/${denuncia.IdDenuncia}`,
            method: "PUT",
          },
        ];
      });
    } catch (error) {
      console.error("Erro ao adicionar links HATEOAS:", error);
      // Continue without links if there's an error
    }

    return res.status(200).json({
      totalPages,
      currentPage: +page,
      total: denuncias.count,
      data: denuncias.rows,
      links: [
        { rel: "criar-denuncia", href: `/denuncias`, method: "POST" },
        ...(page > 1
          ? [
              {
                rel: "pagina-anterior",
                href: `/denuncias?limit=${limit}&page=${page - 1}`,
                method: "GET",
              },
            ]
          : []),
        ...(denuncias.count > page * limit
          ? [
              {
                rel: "proxima-pagina",
                href: `/denuncias?limit=${limit}&page=${+page + 1}`,
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

// Criar uma nova denúncia
const createDenuncia = async (req, res, next) => {
  try {
    const { IdUtilizadorDenunciado, Motivo } = req.body;

    // Validate required fields
    if (!IdUtilizadorDenunciado) {
      throw new ErrorHandler(400, "ID do utilizador denunciado é obrigatório");
    }

    // Validate user ID format
    if (
      !Number.isInteger(Number(IdUtilizadorDenunciado)) ||
      IdUtilizadorDenunciado <= 0
    ) {
      throw new ErrorHandler(400, "ID do denunciado inválido");
    }

    // Validate motivo
    if (!Motivo || typeof Motivo !== "string" || Motivo.trim().length === 0) {
      throw new ErrorHandler(400, "Motivo da denúncia é obrigatório");
    }

    if (Motivo.length > 255) {
      throw new ErrorHandler(
        400,
        "Motivo da denúncia excede o limite de 255 caracteres"
      );
    }

    // Create denuncia
    const newDenuncia = await Denuncia.create({
      IdUtilizadorDenunciado,
      Motivo,
      DataDenuncia: new Date(),
    });

    return res.status(201).json({
      message: "Denúncia criada com sucesso",
      data: newDenuncia,
    });
  } catch (err) {
    next(err);
  }
};

// Deletar uma denúncia
const deleteDenuncia = async (req, res, next) => {
  try {
    const { id } = req.params;

    // 2. Validate ID format
    if (!id || isNaN(id) || Number(id) <= 0) {
      throw new ErrorHandler(400, "ID da denúncia inválido");
    }

    // 3. Find the denuncia
    const denuncia = await Denuncia.findByPk(id);
    if (!denuncia) {
      throw new ErrorHandler(404, "Denúncia não encontrada");
    }

    // 4. Authorization check - only admin can delete denuncias
    if (req.user.Funcao !== "admin") {
      throw new ErrorHandler(
        403,
        "Apenas administradores podem eliminar denúncias"
      );
    }

    // 5. Delete the denuncia
    await denuncia.destroy().catch((error) => {
      throw new ErrorHandler(500, "Erro ao eliminar a denúncia");
    });
    res.status(200).json({
      message: "Denúncia eliminada com sucesso",
    });
  } catch (err) {
    // 7. Error handling
    console.error("Error in deleteDenuncia:", err);

    // Handle specific database errors
    if (err.name === "SequelizeDatabaseError") {
      return next(new ErrorHandler(500, "Erro na base de dados"));
    }

    if (err.name === "SequelizeConnectionError") {
      return next(new ErrorHandler(503, "Erro de conexão com a base de dados"));
    }

    next(err);
  }
};

module.exports = {
  getAllDenuncias,
  createDenuncia,
  deleteDenuncia,
};