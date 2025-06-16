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

    // Get denunciante ID from JWT token
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      throw new ErrorHandler(401, "Token não fornecido");
    }

    const payload = JSON.parse(
      Buffer.from(token.split(".")[1], "base64").toString()
    );
    const IdUtilizadorDenunciante = payload.IdUtilizador;

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

    // Cannot report yourself
    if (IdUtilizadorDenunciante === IdUtilizadorDenunciado) {
      throw new ErrorHandler(400, "Não é possível denunciar a si mesmo");
    }

    // Validate motivo
    if (!Motivo || typeof Motivo !== "string" || Motivo.trim().length === 0) {
      throw new ErrorHandler(400, "Motivo da denúncia é obrigatório");
    }

    if (Motivo.length > 500) {
      throw new ErrorHandler(
        400,
        "Motivo da denúncia excede o limite de 500 caracteres"
      );
    }

    // Check if denunciado exists
    const denunciado = await db.Utilizador.findByPk(IdUtilizadorDenunciado);
    if (!denunciado) {
      throw new ErrorHandler(404, "Utilizador denunciado não encontrado");
    }

    // Check if same denuncia already exists
    const existingDenuncia = await Denuncia.findOne({
      where: {
        IdUtilizadorDenunciante,
        IdUtilizadorDenunciado,
      },
    });

    if (existingDenuncia) {
      throw new ErrorHandler(409, "Já existe uma denúncia similar");
    }

    // Create denuncia
    const newDenuncia = await Denuncia.create({
      IdUtilizadorDenunciante,
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

    // Verificar se a denúncia existe
    const denuncia = await Denuncia.findByPk(id);
    if (!denuncia) {
      throw new ErrorHandler(404, "Denúncia não encontrada");
    }

    // Deletar denúncia
    await denuncia.destroy();

    return res.status(204).json();
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllDenuncias,
  createDenuncia,
  deleteDenuncia,
};
