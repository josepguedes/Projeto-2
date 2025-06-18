const db = require("../models/db.js");
const Anuncio = db.Anuncio;
const UtilizadorBloqueio = db.UtilizadorBloqueio;
const { Op, Sequelize } = require("sequelize");
const { ErrorHandler } = require("../utils/error.js");
const {
  cloudinary,
  uploadToCloudinary,
} = require("../config/cloudinaryConfig");

// Listar todos os anúncios com paginação e filtros
const getAllAnuncios = async (req, res, next) => {
  try {
    const {
      categoria,
      nome,
      localRecolha,
      exclude,
      precoMax,
      dataRecolha,
      page = 1,
      limit = 10,
    } = req.query;
    const where = {};

    // Validação de parâmetros de paginação
    if (isNaN(page) || page < 1) {
      return res.status(400).json({ message: "Página inválida" });
    }
    if (isNaN(limit) || limit < 1) {
      return res.status(400).json({ message: "Limite inválido" });
    }

    // Filtros
    if (categoria) {
      if (isNaN(categoria)) {
        return res.status(400).json({ message: "Categoria inválida" });
      }
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
    if (precoMax) {
      if (isNaN(precoMax)) {
        return res.status(400).json({ message: "Preço máximo inválido" });
      }
      where.Preco = { [Op.lte]: precoMax };
    }
    if (dataRecolha) {
      // Validação rigorosa de data (YYYY-MM-DD e data válida)
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dataRecolha)) {
        return res.status(400).json({ message: "Data de recolha inválida" });
      }
      const [year, month, day] = dataRecolha.split("-").map(Number);
      const dateObj = new Date(dataRecolha);
      if (
        dateObj.getFullYear() !== year ||
        dateObj.getMonth() + 1 !== month ||
        dateObj.getDate() !== day
      ) {
        return res.status(400).json({ message: "Data de recolha inválida" });
      }
      where.DataRecolha = dataRecolha;
    }

    // Filtra apenas anúncios ativos
    where.IdEstadoAnuncio = 1;

    let anuncios;
    try {
      anuncios = await Anuncio.findAndCountAll({
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
        offset: (Math.max(+page, 1) - 1) * (+limit || 10),
      });
    } catch (err) {
      console.error("Erro ao buscar anúncios:", err);
      return res.status(500).json({ message: "Erro ao buscar anúncios" });
    }

    // Se não encontrar anúncios
    if (!anuncios || !anuncios.rows || anuncios.rows.length === 0) {
      return res.status(404).json({ message: "Nenhum anúncio encontrado" });
    }

    return res.status(200).json({
      totalPages: Math.ceil((anuncios.count || 0) / (+limit || 10)),
      currentPage: +page || 1,
      total: anuncios.count || 0,
      data: anuncios.rows || [],
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
        ...(anuncios.count > page * limit
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
    // Erros inesperados
    if (err instanceof ErrorHandler) {
      next(err);
    } else {
      next(new ErrorHandler(500, "Erro inesperado ao buscar anúncios"));
    }
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

    // Check for missing or empty required fields
    const missingFields = requiredFields.filter(
      (field) =>
        req.body[field] === undefined ||
        req.body[field] === null ||
        req.body[field] === ""
    );
    if (missingFields.length > 0) {
      throw new ErrorHandler(
        400,
        `Campos obrigatórios ausentes ou vazios: ${missingFields.join(", ")}`
      );
    }

    // Validate numeric fields
    if (
      isNaN(Number(req.body.IdUtilizadorAnuncio)) ||
      isNaN(Number(req.body.Preco)) ||
      isNaN(Number(req.body.Quantidade)) ||
      isNaN(Number(req.body.IdProdutoCategoria))
    ) {
      throw new ErrorHandler(
        400,
        "IdUtilizadorAnuncio, Preço, Quantidade e IdProdutoCategoria devem ser números válidos"
      );
    }

    // Validate date fields
    const dateFields = ["DataRecolha", "DataValidade"];
    for (const field of dateFields) {
      if (
        !/^\d{4}-\d{2}-\d{2}$/.test(req.body[field]) ||
        isNaN(Date.parse(req.body[field]))
      ) {
        throw new ErrorHandler(
          400,
          `Campo de data inválido: ${field} (esperado formato YYYY-MM-DD)`
        );
      }
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

    // Prepare data for creation, ensuring correct types
    const anuncioData = {
      IdUtilizadorAnuncio: Number(req.body.IdUtilizadorAnuncio),
      Nome: req.body.Nome,
      LocalRecolha: req.body.LocalRecolha,
      HorarioRecolha: req.body.HorarioRecolha,
      DataRecolha: req.body.DataRecolha,
      Descricao: req.body.Descricao,
      Preco: Number(req.body.Preco),
      DataValidade: req.body.DataValidade,
      Quantidade: Number(req.body.Quantidade),
      IdProdutoCategoria: Number(req.body.IdProdutoCategoria),
      DataAnuncio: new Date(),
      IdEstadoAnuncio: 1,
      ImagemAnuncio: imagemAnuncioUrl,
      CloudinaryId: cloudinaryId,
    };

    const anuncio = await Anuncio.create(anuncioData);

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
      return res
        .status(404)
        .json({ message: `Anúncio com ID ${req.params.id} não encontrado` });
    }

    if (Number(req.body.Preco) > 100) {
      throw new ErrorHandler(400, "O preço máximo permitido é 100€");
    }

    if (
      isNaN(Number(req.body.IdUtilizadorAnuncio)) ||
      isNaN(Number(req.body.Preco)) ||
      isNaN(Number(req.body.Quantidade)) ||
      isNaN(Number(req.body.IdProdutoCategoria))
    ) {
      throw new ErrorHandler(
        400,
        "IdUtilizadorAnuncio, Preço, Quantidade e IdProdutoCategoria devem ser números válidos"
      );
    }

    // Permitir atualização se for o dono OU se for atualização após pagamento (IdEstadoAnuncio == 2 e está a reservar)
    if (
      req.body.IdEstadoAnuncio === 1 &&
      req.body.IdUtilizadorReserva === null
    ) {
      // Verifica se o usuário tem permissão para cancelar (dono do anúncio, reservador ou admin)
      if (
        !req.user ||
        (anuncio.IdUtilizadorAnuncio !== req.user.IdUtilizador &&
          anuncio.IdUtilizadorReserva !== req.user.IdUtilizador &&
          req.user.Funcao !== "admin")
      ) {
        return res.status(403).json({
          message: "Você não tem permissão para cancelar esta reserva.",
        });
      }

      // Atualiza apenas os campos necessários para cancelamento
      await anuncio.update({
        IdEstadoAnuncio: 1,
        IdUtilizadorReserva: null,
        DataReserva: null,
        CodigoVerificacao: null,
      });

      return res.status(200).json({
        message: "Reserva cancelada com sucesso",
        data: anuncio,
      });
    }

    if (req.body.IdUtilizadorReserva) {
      const bloqueioExistente = await UtilizadorBloqueio.findOne({
        where: {
          IdBloqueador: anuncio.IdUtilizadorAnuncio,
          IdBloqueado: req.body.IdUtilizadorReserva,
        },
      });

      if (bloqueioExistente) {
        throw new ErrorHandler(
          403,
          "Não pode reservar este anúncio pois foi bloqueado pelo vendedor"
        );
      }
    }

    if (req.file) {
      try {
        if (anuncio.CloudinaryId) {
          try {
            await cloudinary.uploader.destroy(anuncio.CloudinaryId);
          } catch (cloudErr) {
            console.error(
              "Erro ao remover imagem antiga do Cloudinary:",
              cloudErr
            );
          }
        }

        // Upload new image
        const result = await uploadToCloudinary(req.file);
        anuncio.ImagemAnuncio = result.secure_url;
        anuncio.CloudinaryId = result.public_id;
      } catch (error) {
        console.error("Erro ao fazer upload da imagem:", error);
        return res
          .status(500)
          .json({ message: "Erro ao fazer upload da imagem" });
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

    // Validate numeric fields if present
    if (updateData.Preco !== undefined && isNaN(Number(updateData.Preco))) {
      return res
        .status(400)
        .json({ message: "Preço deve ser um número válido" });
    }
    if (
      updateData.Quantidade !== undefined &&
      isNaN(Number(updateData.Quantidade))
    ) {
      return res
        .status(400)
        .json({ message: "Quantidade deve ser um número válido" });
    }
    if (
      updateData.IdProdutoCategoria !== undefined &&
      isNaN(Number(updateData.IdProdutoCategoria))
    ) {
      return res
        .status(400)
        .json({ message: "IdProdutoCategoria deve ser um número válido" });
    }
    if (
      updateData.IdEstadoAnuncio !== undefined &&
      isNaN(Number(updateData.IdEstadoAnuncio))
    ) {
      return res
        .status(400)
        .json({ message: "IdEstadoAnuncio deve ser um número válido" });
    }
    if (
      updateData.IdUtilizadorReserva !== undefined &&
      updateData.IdUtilizadorReserva !== null &&
      updateData.IdUtilizadorReserva !== "" &&
      isNaN(Number(updateData.IdUtilizadorReserva))
    ) {
      return res.status(400).json({
        message: "IdUtilizadorReserva deve ser um número válido ou nulo",
      });
    }

    // Validate date fields if present
    const dateFields = ["DataValidade", "DataReserva"];
    for (const field of dateFields) {
      if (
        updateData[field] !== undefined &&
        updateData[field] !== null &&
        updateData[field] !== ""
      ) {
        if (
          !/^\d{4}-\d{2}-\d{2}$/.test(updateData[field]) ||
          isNaN(Date.parse(updateData[field]))
        ) {
          return res.status(400).json({
            message: `Campo de data inválido: ${field} (esperado formato YYYY-MM-DD)`,
          });
        }
      }
    }

    // Convert empty string or "null" to null
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === "null" || updateData[key] === "")
        updateData[key] = null;
    });

    // Apply type conversions
    if (updateData.Preco !== undefined && updateData.Preco !== null)
      updateData.Preco = Number(updateData.Preco);
    if (updateData.Quantidade !== undefined && updateData.Quantidade !== null)
      updateData.Quantidade = Number(updateData.Quantidade);
    if (
      updateData.IdProdutoCategoria !== undefined &&
      updateData.IdProdutoCategoria !== null
    )
      updateData.IdProdutoCategoria = Number(updateData.IdProdutoCategoria);
    if (
      updateData.IdEstadoAnuncio !== undefined &&
      updateData.IdEstadoAnuncio !== null
    )
      updateData.IdEstadoAnuncio = Number(updateData.IdEstadoAnuncio);
    if (
      updateData.IdUtilizadorReserva !== undefined &&
      updateData.IdUtilizadorReserva !== null
    )
      updateData.IdUtilizadorReserva = Number(updateData.IdUtilizadorReserva);

    try {
      await anuncio.update({
        ...updateData,
        ImagemAnuncio: anuncio.ImagemAnuncio,
        CloudinaryId: anuncio.CloudinaryId,
      });
    } catch (err) {
      console.error("Erro ao atualizar anúncio:", err);
      return res.status(500).json({ message: "Erro ao atualizar anúncio" });
    }

    res.status(200).json({
      message: "Anúncio atualizado com sucesso",
      data: anuncio,
    });
  } catch (err) {
    console.error("Erro inesperado em updateAnuncio:", err);
    if (err instanceof ErrorHandler) {
      next(err);
    } else {
      next(new ErrorHandler(500, "Erro inesperado ao atualizar anúncio"));
    }
  }
};

// Deletar anúncio
const deleteAnuncio = async (req, res, next) => {
  try {
    const anuncio = await Anuncio.findByPk(req.params.id);

    if (!anuncio) {
      throw new ErrorHandler(
        404,
        `Anúncio com ID ${req.params.id} não encontrado`
      );
    }

    if (anuncio.IdEstadoAnuncio === 2) {
      throw new ErrorHandler(
        400,
        "Não é possível eliminar um anúncio que está reservado."
      );
    }

    if (anuncio.IdEstadoAnuncio === 3) {
      throw new ErrorHandler(
        400,
        "Não é possível eliminar um anúncio que já foi concluído."
      );
    }

    // Permitir eliminação se for o dono OU se for admin
    if (
      !req.user ||
      (anuncio.IdUtilizadorAnuncio !== req.user.IdUtilizador &&
        req.user.Funcao !== "admin")
    ) {
      return res.status(403).json({
        message:
          "Apenas o dono do anúncio ou um administrador pode eliminar este anúncio.",
      });
    }

    const result = await Anuncio.destroy({
      where: { IdAnuncio: req.params.id },
    });

    res.status(200).json({
      message: "Anúncio eliminado com sucesso",
      data: anuncio,
    });
  } catch (err) {
    next(err);
  }
};

// Obter anúncio por ID
const getAnuncioById = async (req, res, next) => {
  try {
    if (!req.params.id || isNaN(req.params.id)) {
      return res
        .status(400)
        .json({ message: "ID do anúncio é obrigatório e deve ser um número" });
    }

    let anuncio;
    try {
      anuncio = await Anuncio.findByPk(req.params.id, {
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
            attributes: [
              "IdUtilizador",
              "Nome",
              "ImagemPerfil",
              "Classificacao",
            ],
            required: false,
            where: {
              IdUtilizador: db.sequelize.col("Anuncio.IdUtilizadorReserva"),
            },
          },
        ],
      });
    } catch (err) {
      // Outros erros
      console.error("Erro ao buscar anúncio:", err);
      return res.status(500).json({ message: "Erro ao buscar anúncio" });
    }

    if (!anuncio) {
      return res.status(404).json({
        message: `Anúncio com ID ${req.params.id} não encontrado`,
      });
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
    // Erro inesperado
    if (err instanceof ErrorHandler) {
      console.error("Erro inesperado em getAnuncioById:", err);
      next(new ErrorHandler(500, "Erro inesperado ao buscar anúncio"));
    }
  }
};

// Obter anúncios por utilizador
const getAnunciosByUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Validação de parâmetros
    if (!userId || isNaN(userId)) {
      return res.status(400).json({
        message: "ID do utilizador é obrigatório e deve ser um número",
      });
    }
    if (isNaN(page) || page < 1) {
      return res.status(400).json({ message: "Página inválida" });
    }
    if (isNaN(limit) || limit < 1) {
      return res.status(400).json({ message: "Limite inválido" });
    }

    let count, rows;
    try {
      const result = await Anuncio.findAndCountAll({
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
      count = result.count;
      rows = result.rows;
    } catch (err) {
      // Outros erros
      console.error("Erro ao buscar anúncios do utilizador:", err);
      return res
        .status(500)
        .json({ message: "Erro ao buscar anúncios do utilizador" });
    }

    // Se não encontrar anúncios
    if (!rows || rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Nenhum anúncio encontrado para este utilizador" });
    }

    // Resposta
    res.status(200).json({
      totalPages: Math.ceil(count / (+limit || 10)),
      currentPage: +page || 1,
      total: count,
      data: rows,
      links: [
        {
          rel: "self",
          href: `/anuncios/utilizador/${userId}?page=${page}&limit=${limit}`,
          method: "GET",
        },
        { rel: "all", href: "/anuncios", method: "GET" },
      ],
    });
  } catch (err) {
    // Erro inesperado
    if (err instanceof ErrorHandler) {
      next(err);
    } else if (err.name === "SyntaxError") {
      console.error("Erro de sintaxe:", err);
      next(new ErrorHandler(400, "Erro de sintaxe na requisição"));
    } else if (err.name === "TypeError") {
      console.error("Erro de tipo:", err);
      next(new ErrorHandler(400, "Erro de tipo na requisição"));
    } else {
      console.error("Erro inesperado em getAnunciosByUser:", err);
      next(
        new ErrorHandler(
          500,
          "Erro inesperado ao buscar anúncios do utilizador"
        )
      );
    }
  }
};

// Get anuncio by category
const getAnunciosByCategory = async (req, res, next) => {
  try {
    const { categoryId } = req.params;

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
        {
          rel: "self",
          href: `/anuncios/category/${categoryId}`,
          method: "GET",
        },
        { rel: "all", href: "/anuncios", method: "GET" },
      ],
    });
  } catch (err) {
    next(err);
  }
};

const getReservasByUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Validação do parâmetro userId
    if (!userId || isNaN(userId)) {
      return res.status(400).json({
        message: "ID do utilizador é obrigatório e deve ser um número",
      });
    }

    if (isNaN(page) || page < 1) {
      return res.status(400).json({ message: "Página inválida" });
    }
    if (isNaN(limit) || limit < 1) {
      return res.status(400).json({ message: "Limite inválido" });
    }

    let count, rows;
    try {
      const result = await Anuncio.findAndCountAll({
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
      count = result.count;
      rows = result.rows;
    } catch (err) {
      console.error("Erro ao buscar reservas do utilizador:", err);
      return res
        .status(500)
        .json({ message: "Erro ao buscar reservas do utilizador" });
    }

    // Se não encontrar reservas
    if (!rows || rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Nenhuma reserva encontrada para este utilizador" });
    }

    res.status(200).json({
      totalPages: Math.ceil(count / (+limit || 10)),
      currentPage: +page || 1,
      total: count,
      data: rows,
      links: [
        {
          rel: "self",
          href: `/anuncios/reservas/${userId}?page=${page}&limit=${limit}`,
          method: "GET",
        },
        { rel: "all", href: "/anuncios", method: "GET" },
      ],
    });
  } catch (err) {
    if (err instanceof ErrorHandler) {
      console.error("Erro inesperado em getReservasByUser:", err);
      next(
        new ErrorHandler(
          500,
          "Erro inesperado ao buscar reservas do utilizador"
        )
      );
    }
  }
};

// Confirmar código de entrega
const confirmarCodigoEntrega = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { codigo } = req.body;

    //Validação de parâmetros
    if (!id || isNaN(id)) {
      return next(
        new ErrorHandler(
          400,
          "ID da reserva é obrigatório e deve ser um número"
        )
      );
    }
    if (!codigo || typeof codigo !== "string" || codigo.trim() === "") {
      return next(new ErrorHandler(400, "Código de verificação é obrigatório"));
    }

    // Buscar anúncio
    let anuncio;
    try {
      anuncio = await Anuncio.findByPk(id);
    } catch (err) {
      console.error("Erro ao buscar anúncio:", err);
      return next(new ErrorHandler(500, "Erro ao buscar anúncio"));
    }

    if (!anuncio) {
      return next(new ErrorHandler(404, "Anúncio não encontrado"));
    }

    // Verifica se já está concluído
    if (anuncio.IdEstadoAnuncio === 3) {
      return next(new ErrorHandler(409, "Este anúncio já foi concluído"));
    }

    // Verifica se o anúncio está reservado
    if (anuncio.IdEstadoAnuncio !== 2) {
      return next(new ErrorHandler(400, "Este anúncio não está reservado"));
    }

    // Verifica se existe código de verificação
    if (!anuncio.CodigoVerificacao) {
      return next(
        new ErrorHandler(400, "Este anúncio não possui código de verificação")
      );
    }

    // Verifica o código
    if (anuncio.CodigoVerificacao !== codigo) {
      return next(new ErrorHandler(400, "Código incorreto"));
    }

    // Atualiza estado do anúncio
    try {
      anuncio.IdEstadoAnuncio = 3; // Finalizador
      await anuncio.save();
    } catch (err) {
      console.error("Erro ao atualizar estado do anúncio:", err);
      return next(new ErrorHandler(500, "Erro ao atualizar estado do anúncio"));
    }

    return res.status(200).json({
      message: "Entrega confirmada com sucesso",
      data: anuncio,
      links: [
        { rel: "self", href: `/anuncios/${anuncio.IdAnuncio}`, method: "GET" },
        { rel: "avaliar", href: `/avaliacoes`, method: "POST" },
        { rel: "all", href: "/anuncios", method: "GET" },
      ],
    });
  } catch (err) {
    console.error("Erro inesperado em confirmarCodigoEntrega:", err);
    if (err instanceof ErrorHandler) {
      next(err);
    } else {
      next(new ErrorHandler(500, "Erro inesperado ao confirmar entrega"));
    }
  }
};

// Listar todas as reservas existentes (todos os anúncios que têm IdUtilizadorReserva não nulo)
const getAllReservas = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    if (isNaN(page) || page < 1) {
      return res.status(400).json({ message: "Página inválida" });
    }
    if (isNaN(limit) || limit < 1) {
      return res.status(400).json({ message: "Limite inválido" });
    }

    let result;
    try {
      result = await Anuncio.findAndCountAll({
        where: { IdUtilizadorReserva: { [Op.ne]: null } },
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
          {
            model: db.EstadoAnuncio,
            as: "estado",
            attributes: ["EstadoAnuncio"],
          },
        ],
        order: [["DataReserva", "DESC"]],
        limit: Math.min(+limit || 10, 100),
        offset: (Math.max(+page, 1) - 1) * (+limit || 10),
      });
    } catch (err) {
      return res.status(500).json({ message: "Erro ao buscar reservas" });
    }

    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({ message: "Nenhuma reserva encontrada" });
    }

    res.status(200).json({
      totalPages: Math.ceil(result.count / (+limit || 10)),
      currentPage: +page || 1,
      total: result.count,
      data: result.rows,
      links: [
        {
          rel: "self",
          href: `/anuncios/reservas?page=${page}&limit=${limit}`,
          method: "GET",
        },
        { rel: "all", href: "/anuncios", method: "GET" },
      ],
    });
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
  getAllReservas,
};
