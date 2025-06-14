const db = require("../models/db.js");
const Denuncia = db.Denuncia;
const { Op } = require("sequelize");
const { ErrorHandler } = require("../utils/error.js");

//Listar todas as denúncias com paginação e filtros
const getAllDenuncias = async (req, res, next) => {
  try {
    const { idDenuncia, idAnuncio, page = 1, limit = 10 } = req.query;
    const where = {};

    // Filtros
    if (idDenuncia) {
      where.IdDenuncia = { [Op.like]: `%${idDenuncia}%` };
    }
    if (idAnuncio) {
      where.IdAnuncio = { [Op.like]: `%${idAnuncio}%` };
    }

    // Validar página e limite
    if (isNaN(page) || page < 1) {
      throw new ErrorHandler(400, "Página inválida");
    }
    if (isNaN(limit) || limit < 1) {
      throw new ErrorHandler(400, "Limite inválido");
    }

    const denuncias = await Denuncia.findAndCountAll({
      where,
      order: [["DataDenuncia", "DESC"]],
      limit: +limit,
      offset: (+page - 1) * +limit,
    });

    // Links HATEOAS para cada denúncia
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

    return res.status(200).json({
      totalPages: Math.ceil(denuncias.count / limit),
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
        const {
            IdUtilizadorDenunciante,
            IdUtilizadorDenunciado,
            Motivo
        } = req.body;

        // Validar campos obrigatórios
        if (!IdUtilizadorDenunciante || !IdUtilizadorDenunciado || !Motivo) {
            throw new ErrorHandler(400, "Campos obrigatórios ausentes: IdUtilizadorDenunciante, IdUtilizadorDenunciado e Motivo são obrigatórios");
        }

        // Criar nova denúncia
        const denuncia = await Denuncia.create({
            IdUtilizadorDenunciante,
            IdUtilizadorDenunciado,
            Motivo,
            DataDenuncia: new Date()
        });

        return res.status(201).json({
            message: "Denúncia criada com sucesso",
            data: denuncia
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
