const db = require("../models/db.js");
const Utilizador = db.Utilizador;
const { ErrorHandler } = require("../utils/error.js");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { cloudinary, uploadToCloudinary } = require('../config/cloudinaryConfig');

// Função para criar um novo utilizador
const createUser = async (req, res, next) => {
    try {
        const { Nome, Email, Password } = req.body;

        // Validate required fields
        if (!Nome || !Email || !Password) {
            throw new ErrorHandler(400, "Nome, Email e Password são obrigatórios.");
        }

        // Check if email exists
        const existingUser = await Utilizador.findOne({ where: { Email } });
        if (existingUser) {
            throw new ErrorHandler(409, "Email já registado.");
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(Password, 10);

        let imagemPerfilUrl = null;
        let cloudinaryId = null;

        if (req.file) {
            try {
                // Delete old image if exists
                if (utilizador.CloudinaryId) {
                    console.log('Deleting old image:', utilizador.CloudinaryId);
                    await cloudinary.uploader.destroy(utilizador.CloudinaryId);
                }

                // Upload new image
                const result = await uploadToCloudinary(req.file);
                utilizador.ImagemPerfil = result.secure_url;
                utilizador.CloudinaryId = result.public_id;

                console.log('New image uploaded:', {
                    url: result.secure_url,
                    id: result.public_id
                });
            } catch (error) {
                console.error('Error handling image:', error);
                throw new ErrorHandler(500, "Erro ao fazer upload da imagem");
            }
        }

        // Create user
        const novoUtilizador = await Utilizador.create({
            Nome,
            Email,
            Password: hashedPassword,
            ImagemPerfil: imagemPerfilUrl,
            CloudinaryId: cloudinaryId
        });

        res.status(201).json({
            message: "Utilizador criado com sucesso.",
            data: {
                IdUtilizador: novoUtilizador.IdUtilizador,
                Nome: novoUtilizador.Nome,
                Email: novoUtilizador.Email,
                ImagemPerfil: novoUtilizador.ImagemPerfil
            }
        });
    } catch (err) {
        next(err);
    }
};

// Função de login com JWT
const loginUser = async (req, res, next) => {
    try {
        const { Email, Password } = req.body;

        if (!Email || !Password) {
            throw new ErrorHandler(400, "Email e Password são obrigatórios.");
        }

        const utilizador = await Utilizador.findOne({ where: { Email } });
        if (!utilizador) {
            throw new ErrorHandler(401, "Credenciais inválidas.");
        }

        const passwordMatch = await bcrypt.compare(Password, utilizador.Password);
        if (!passwordMatch) {
            throw new ErrorHandler(401, "Credenciais inválidas.");
        }
        
        // Verificar bloqueio administrativo
        const bloqueio = await db.AdminBloqueio.findOne({
            where: {
                IdBloqueado: utilizador.IdUtilizador,
                [db.Sequelize.Op.or]: [
                    { DataFimBloqueio: null },
                    { DataFimBloqueio: { [db.Sequelize.Op.gt]: new Date() } }
                ]
            }
        });

        if (bloqueio) {
            let msg = "A sua conta está bloqueada";
            if (bloqueio.DataFimBloqueio) {
                msg += ` até ${new Date(bloqueio.DataFimBloqueio).toLocaleDateString('pt-PT')}`;
            } else {
                msg += " permanentemente";
            }
            return res.status(403).json({ message: msg });
        }

        // Gera o token JWT
        const token = jwt.sign(
            {
                IdUtilizador: utilizador.IdUtilizador,
                Email: utilizador.Email,
                Funcao: utilizador.Funcao
            },
            process.env.JWT_SECRET || "segredo_super_secreto",
            { expiresIn: "2h" }
        );

        res.status(200).json({
            message: "Login efetuado com sucesso.",
            token,
            user: {
                IdUtilizador: utilizador.IdUtilizador,
                Nome: utilizador.Nome,
                Email: utilizador.Email,
                Funcao: utilizador.Funcao
            }
        });
    } catch (err) {
        next(err);
    }
};

const getUserDetails = async (req, res, next) => {
    try {
        const utilizador = await Utilizador.findByPk(req.params.id, {
            attributes: [
                'IdUtilizador',
                'Nome',
                'ImagemPerfil',
                'Email',
                'Funcao',
                'Nif',
                'DataNascimento',
                'DataRegisto'
            ]
        });

        // Verifica se o utilizador estaá autenticado
        if (!req.user || !req.user.IdUtilizador) {
            throw new ErrorHandler(401, 'Utilizador não autenticado');
        }

        // Verifica se o utilizador é o mesmo que está a ser consultado
        if (utilizador.IdUtilizador !== req.user.IdUtilizador) {
            throw new ErrorHandler(403, 'Acesso negado. Não pode consultar detalhes de outro utilizador.');
        }

        // Verifica se o utilizador existe
        if (!utilizador) {
            throw new ErrorHandler(404, 'Utilizador não encontrado');
        }

        res.json(utilizador);
    } catch (err) {
        next(err);
    }
}

const getAllUsers = async (req, res, next) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        // Validar página e limite
        if (isNaN(page) || page < 1) {
            throw new ErrorHandler(400, 'Página inválida');
        }
        if (isNaN(limit) || limit < 1) {
            throw new ErrorHandler(400, 'Limite inválido');
        }

        // Verifica se o utilizador é administrador
        if (!req.user || req.user.Funcao !== 'admin') {
            throw new ErrorHandler(403, 'Acesso negado. Apenas administradores podem listar utilizadores.');
        } 

        const utilizadores = await Utilizador.findAndCountAll({
            attributes: ['IdUtilizador', 'Nome', 'Email', 'Funcao', 'ImagemPerfil'],
            order: [['Nome', 'DESC']],
            limit: +limit,
            offset: (+page - 1) * +limit
        });

        return res.status(200).json({
            totalPages: Math.ceil(utilizadores.count / limit),
            currentPage: +page,
            total: utilizadores.count,
            data: utilizadores.rows
        });
    } catch (err) {
        next(err);
    }
};

// Função utilitária para validar NIF português
function isValidNif(nif) {
    return /^[1235689]\d{8}$/.test(nif);
}


const updateUser = async (req, res, next) => {
    try {
        const { Nome, Email, Password } = req.body;
        const utilizadorId = req.params.id;

        // Verifica se o utilizador está autenticado
        if (!req.user || !req.user.IdUtilizador) {  
            throw new ErrorHandler(401, "Utilizador não autenticado.");
        }

        // Verifica se o utilizador é o mesmo que está a ser atualizado
        if (utilizadorId !== req.user.IdUtilizador) {
            throw new ErrorHandler(403, "Acesso negado. Não pode atualizar outro utilizador.");
        }

        const utilizador = await Utilizador.findByPk(utilizadorId);
        if (!utilizador) {
            throw new ErrorHandler(404, "Utilizador não encontrado.");
        }

        // Handle image update if there's a file
        if (req.file) {
            try {
                // Delete old image if exists
                if (utilizador.CloudinaryId) {
                    await cloudinary.uploader.destroy(utilizador.CloudinaryId);
                }

                // Upload new image using the utility function
                const result = await uploadToCloudinary(req.file);
                utilizador.ImagemPerfil = result.secure_url;
                utilizador.CloudinaryId = result.public_id;
            } catch (error) {
                throw new ErrorHandler(500, "Erro ao fazer upload da imagem");
            }
        }

        // Update other fields
        utilizador.Nome = Nome || utilizador.Nome;
        utilizador.Email = Email || utilizador.Email;
        if (Password) {
            utilizador.Password = await bcrypt.hash(Password, 10);
        }

        if (req.body.Nif !== undefined && req.body.Nif !== null && req.body.Nif !== '') {
            if (!isValidNif(String(req.body.Nif))) {
                throw new ErrorHandler(400, "NIF inválido. Deve ter 9 dígitos e começar por 1, 2, 3, 5, 6, 8 ou 9.");
            }
        }

        // Adiciona isto:
        if (req.body.Nif !== undefined) utilizador.Nif = req.body.Nif;
        if (req.body.DataNascimento !== undefined) utilizador.DataNascimento = req.body.DataNascimento;
        if (req.body.Telefone !== undefined) utilizador.Telefone = req.body.Telefone;
        if (req.body.Morada !== undefined) utilizador.Morada = req.body.Morada;

        await utilizador.save();

        res.status(200).json({
            message: "Utilizador atualizado com sucesso.",
            data: {
                IdUtilizador: utilizador.IdUtilizador,
                Nome: utilizador.Nome,
                Email: utilizador.Email,
                ImagemPerfil: utilizador.ImagemPerfil,
                Nif: utilizador.Nif,
                DataNascimento: utilizador.DataNascimento
            }
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    createUser,
    loginUser,
    getUserDetails,
    updateUser,
    getAllUsers
};