const db = require("../models/db.js");
const Anuncio = db.Anuncio;
const { Op, Sequelize } = require("sequelize");
const { ErrorHandler } = require("../utils/error.js");
const {
  cloudinary,
  uploadToCloudinary,
} = require("../config/cloudinaryConfig");

// Listar todos os anúncios com paginação e filtros
const getAllAnuncios = async (req, res, next) => {
  try {
    const { categoria, nome, localRecolha, exclude, precoMax, dataRecolha, page = 1, limit = 10 } = req.query;
    const where = {};

    if (categoria) {
      where.IdProdutoCategoria = categoria;
    }
    if (nome && typeof nome === "string") {
      where.Nome = { [Op.like]: `%${nome}%` };
    }
    if (localRecolha && typeof localRecolha === "string") {
      where.LocalRecolha = { [Op.like]: `%${localRecolha}%` };
    }
    if (exclude && !isNaN(exclude)) {
      where.IdAnuncio = { [Op.ne]: exclude };
    }
    // Adiciona filtro de preço máximo
    if (precoMax) {
      where.Preco = { [Op.lte]: precoMax };
    }
    // Adiciona filtro de data de recolha
    if (dataRecolha) {
      where.DataRecolha = dataRecolha;
    }

    // Filtra apenas anúncios ativos
    where.IdEstadoAnuncio = 1


    const anuncios = await Anuncio.findAndCountAll({
      where,
      include: [
        {
          model: db.Utilizador,
          as: "utilizador",
          attributes: ["Nome", "ImagemPerfil", "Classificacao"],
          required: false,
        },
        {
          model: db.EstadoAnuncio,
          as: "estado",
          attributes: ["EstadoAnuncio"],
          required: false,
        },
      ],
      order: [["DataAnuncio", "DESC"]],
      limit: Math.min(+limit || 10, 100),
      offset: Math.max(+page - 1 || 0, 0) * (+limit || 10),
    });

    return res.status(200).json({
      totalPages: Math.ceil((anuncios?.count || 0) / (+limit || 10)),
      currentPage: +page || 1,
      total: anuncios?.count || 0,
      data: anuncios?.rows || [],
      links: [
        { rel: "criar-anuncio", href: "/anuncios", method: "POST" },
        ...(page > 1
          ? [
            {
              rel: "pagina-anterior",
              href: `/anuncios?limit=${limit}&page=${page - 1}`,
              method: "GET",
            },
          ]
          : []),
        ...(anuncios?.count > page * limit
          ? [
            {
              rel: "proxima-pagina",
              href: `/anuncios?limit=${limit}&page=${+page + 1}`,
              method: "GET",
            },
          ]
          : []),
      ],
    });
  } catch (err) {
    console.error("Error in getAllAnuncios:", err);
    next(new ErrorHandler(500, "Erro ao buscar anúncios"));
  }
};

// Criar novo anúncio
const createAnuncio = async (req, res, next) => {
  try {
    const requiredFields = [
      "IdUtilizadorAnuncio",
      "Nome",
      "LocalRecolha",
      "HorarioRecolha",
      "DataRecolha",
      "Descricao",
      "Preco",
      "DataValidade",
      "Quantidade",
      "IdProdutoCategoria",
    ];

    const missingFields = requiredFields.filter((field) => !req.body[field]);
    if (missingFields.length > 0) {
      throw new ErrorHandler(
        400,
        `Campos obrigatórios ausentes: ${missingFields.join(", ")}`
      );
    }

    let imagemAnuncioUrl = null;
    let cloudinaryId = null;

    if (req.file) {
      try {
        const result = await uploadToCloudinary(req.file);
        imagemAnuncioUrl = result.secure_url;
        cloudinaryId = result.public_id;
      } catch (error) {
        console.error("Cloudinary upload error:", error);
        throw new ErrorHandler(500, "Erro ao fazer upload da imagem");
      }
    }

    const anuncio = await Anuncio.create({
      ...req.body,
      DataAnuncio: new Date(),
      IdEstadoAnuncio: 1,
      ImagemAnuncio: imagemAnuncioUrl,
      CloudinaryId: cloudinaryId,
    });

    res.status(201).json({
      message: "Anúncio criado com sucesso",
      data: anuncio,
      links: [
        { rel: "self", href: `/anuncios/${anuncio.IdAnuncio}`, method: "GET" },
        {
          rel: "delete",
          href: `/anuncios/${anuncio.IdAnuncio}`,
          method: "DELETE",
        },
        {
          rel: "modify",
          href: `/anuncios/${anuncio.IdAnuncio}`,
          method: "PUT",
        },
      ],
    });
  } catch (err) {
    console.error("Create anuncio error:", err);
    next(err);
  }
};

// Atualizar anúncio
const updateAnuncio = async (req, res, next) => {
  try {
    const anuncio = await Anuncio.findByPk(req.params.id);

    if (!anuncio) {
      throw new ErrorHandler(
        404,
        `Anúncio com ID ${req.params.id} não encontrado`
      );
    }

    if (req.file) {
      try {
        if (anuncio.CloudinaryId) {
          await cloudinary.uploader.destroy(anuncio.CloudinaryId);
        }

        const result = await uploadToCloudinary(req.file);
        anuncio.ImagemAnuncio = result.secure_url;
        anuncio.CloudinaryId = result.public_id;
      } catch (error) {
        throw new ErrorHandler(500, "Erro ao fazer upload da imagem");
      }
    }

    const allowedUpdates = [
      "Nome",
      "Descricao",
      "LocalRecolha",
      "HorarioRecolha",
      "Preco",
      "DataValidade",
      "Quantidade",
      "IdProdutoCategoria",
      "IdEstadoAnuncio",
      "CodigoVerificacao",
      "IdUtilizadorReserva",
      "DataReserva",
    ];

    const updateData = {};
    Object.keys(req.body).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        updateData[key] = req.body[key];
      }
    });

    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === "null" || updateData[key] === "") updateData[key] = null;
    });

    await anuncio.update({
      ...updateData,
      ImagemAnuncio: anuncio.ImagemAnuncio,
      CloudinaryId: anuncio.CloudinaryId,
    });

    res.status(200).json({
      message: "Anúncio atualizado com sucesso",
      data: anuncio,
    });
  } catch (err) {
    next(err);
  }
};

// Deletar anúncio
const deleteAnuncio = async (req, res, next) => {
  try {
    const result = await Anuncio.destroy({
      where: { IdAnuncio: req.params.id },
    });

    if (result === 0) {
      throw new ErrorHandler(
        404,
        `Anúncio com ID ${req.params.id} não encontrado`
      );
    }

    res.status(204).json();
  } catch (err) {
    next(err);
  }
};

// Obter anúncio por ID
const getAnuncioById = async (req, res, next) => {
  try {
    const anuncio = await Anuncio.findByPk(req.params.id, {
      include: [
        {
          model: db.Utilizador,
          as: "utilizador",
          attributes: ["Nome", "ImagemPerfil", "Classificacao"],
          where: {
            IdUtilizador: db.sequelize.col("Anuncio.IdUtilizadorAnuncio"),
          },
        },
        {
          model: db.Utilizador,
          as: "reservador",
          attributes: ["IdUtilizador", "Nome", "ImagemPerfil", "Classificacao"],
          required: false,
          where: {
            IdUtilizador: db.sequelize.col("Anuncio.IdUtilizadorReserva"),
          },
        },
      ],
    });

    if (!anuncio) {
      throw new ErrorHandler(
        404,
        `Anúncio com ID ${req.params.id} não encontrado`
      );
    }

    res.status(200).json({
      data: anuncio,
      links: [
        { rel: "self", href: `/anuncios/${anuncio.IdAnuncio}`, method: "GET" },
        {
          rel: "delete",
          href: `/anuncios/${anuncio.IdAnuncio}`,
          method: "DELETE",
        },
        {
          rel: "modify",
          href: `/anuncios/${anuncio.IdAnuncio}`,
          method: "PUT",
        },
        { rel: "all", href: "/anuncios", method: "GET" },
      ],
    });
  } catch (err) {
    next(err);
  }
};

// Obter anúncios por utilizador
const getAnunciosByUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!userId) {
      throw new ErrorHandler(400, "ID do utilizador é obrigatório");
    }

    const { count, rows } = await Anuncio.findAndCountAll({
      where: { IdUtilizadorAnuncio: userId },
      include: [
        {
          model: db.Utilizador,
          as: "utilizador",
          attributes: ["Nome", "ImagemPerfil", "Classificacao"],
        },
        {
          model: db.EstadoAnuncio,
          as: "estado",
          attributes: ["EstadoAnuncio"],
        },
      ],
      order: [["DataAnuncio", "DESC"]],
      limit: Math.min(+limit || 10, 100),
      offset: (Math.max(+page, 1) - 1) * (+limit || 10),
    });

    res.status(200).json({
      totalPages: Math.ceil(count / (+limit || 10)),
      currentPage: +page || 1,
      total: count,
      data: rows,
      links: [
        { rel: "self", href: `/anuncios/utilizador/${userId}?page=${page}&limit=${limit}`, method: "GET" },
        { rel: "all", href: "/anuncios", method: "GET" },
      ],
    });
  } catch (err) {
    next(err);
  }
};

// Get anuncio by category
const getAnunciosByCategory = async (req, res, next) => {
  try {
    const { categoryId } = req.params;

    if (!categoryId) {
      throw new ErrorHandler(400, "ID da categoria é obrigatório");
    }

    const anuncios = await Anuncio.findAll({
      where: { IdProdutoCategoria: categoryId },
      include: [
        {
          model: db.Utilizador,
          as: "utilizador",
          attributes: ["Nome", "ImagemPerfil", "Classificacao"],
        },
        {
          model: db.EstadoAnuncio,
          as: "estado",
          attributes: ["EstadoAnuncio"],
        },
      ],
      order: [["DataAnuncio", "DESC"]],
    });

    if (anuncios.length === 0) {
      return res
        .status(404)
        .json({ message: "Nenhum anúncio encontrado para esta categoria" });
    }

    res.status(200).json({
      data: anuncios,
      links: [
        { rel: "self", href: `/anuncios/category/${categoryId}`, method: "GET" },
        { rel: "all", href: "/anuncios", method: "GET" },
      ],
    });
  } catch (err) {
    next(err);
  }
};

// Server/controllers/anuncios.controllers.js
const getReservasByUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!userId) {
      throw new ErrorHandler(400, "ID do utilizador é obrigatório");
    }

    const { count, rows } = await Anuncio.findAndCountAll({
      where: { IdUtilizadorReserva: userId },
      include: [
        {
          model: db.Utilizador,
          as: "utilizador",
          attributes: ["Nome", "ImagemPerfil"],
        },
        {
          model: db.Utilizador,
          as: "reservador",
          attributes: ["Nome", "ImagemPerfil"],
        },
      ],
      order: [["DataReserva", "DESC"]],
      limit: Math.min(+limit || 10, 100),
      offset: (Math.max(+page, 1) - 1) * (+limit || 10),
    });

    res.status(200).json({
      totalPages: Math.ceil(count / (+limit || 10)),
      currentPage: +page || 1,
      total: count,
      data: rows,
    });
  } catch (err) {
    next(err);
  }
};

// Confirmar código de entrega
const confirmarCodigoEntrega = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { codigo } = req.body;

    const anuncio = await Anuncio.findByPk(id);
    if (!anuncio) {
      return res.status(404).json({ message: "Anúncio não encontrado" });
    }

    if (anuncio.CodigoVerificacao !== codigo) {
      return res.status(400).json({ message: "Código incorreto" });
    }

    anuncio.IdEstadoAnuncio = 3; // Concluído
    await anuncio.save();

    return res.status(200).json({ message: "Entrega confirmada com sucesso", data: anuncio });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllAnuncios,
  getAnuncioById,
  createAnuncio,
  updateAnuncio,
  deleteAnuncio,
  getAnunciosByUser,
  getAnunciosByCategory,
  getReservasByUser,
  confirmarCodigoEntrega,
};
