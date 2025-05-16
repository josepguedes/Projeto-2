const db = require("../models/db.js");
const Utilizador = db.Utilizador;
const { ErrorHandler } = require("../utils/error.js");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// Função para criar um novo utilizador
const createUser = async (req, res, next) => {
    try {
        const { Nome, Email, Password } = req.body;

        // Verifica campos obrigatórios
        if (!Nome || !Email || !Password) {
            throw new ErrorHandler(400, "Nome, Email e Password são obrigatórios.");
        }

        // Verifica se o email já existe
        const existingUser = await Utilizador.findOne({ where: { Email } });
        if (existingUser) {
            throw new ErrorHandler(409, "Email já registado.");
        }

        // Hash da password
        const hashedPassword = await bcrypt.hash(Password, 10);

        // Cria o utilizador
        const novoUtilizador = await Utilizador.create({
            Nome,
            Email,
            Password: hashedPassword
        });

        res.status(201).json({
            message: "Utilizador criado com sucesso.",
            data: {
                IdUtilizador: novoUtilizador.IdUtilizador,
                Nome: novoUtilizador.Nome,
                Email: novoUtilizador.Email
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
            attributes: ['IdUtilizador', 'Nome', 'ImagemPerfil', 'Email']
        });

        if (!utilizador) {
            throw new ErrorHandler(404, 'Utilizador não encontrado');
        }

        res.json(utilizador);
    } catch (err) {
        next(err);
    }
};

const getAllUsers = async (req, res, next) => {
    try {
        const utilizadores = await Utilizador.findAll({
            attributes: ['IdUtilizador', 'Nome', 'ImagemPerfil', 'Email']
        });

        if (!utilizadores) {
            throw new ErrorHandler(404, 'Nenhum utilizador encontrado');
        }

        res.json(utilizadores);
    } catch (err) {
        next(err);
    }
}


const updateUser = async (req, res, next) => {
    try {
        const { Nome, Email, Password, ImagemPerfil} = req.body;
        const utilizadorId = req.params.id;

        // Verifica se o utilizador existe
        const utilizador = await Utilizador.findByPk(utilizadorId);
        if (!utilizador) {
            throw new ErrorHandler(404, "Utilizador não encontrado.");
        }

        // Atualiza os campos do utilizador
        utilizador.Nome = Nome || utilizador.Nome;
        utilizador.Email = Email || utilizador.Email;
        utilizador.ImagemPerfil = ImagemPerfil || utilizador.ImagemPerfil;
        if (Password) {
            utilizador.Password = await bcrypt.hash(Password, 10);
        }

        await utilizador.save();

        res.status(200).json({
            message: "Utilizador atualizado com sucesso.",
            data: {
                IdUtilizador: utilizador.IdUtilizador,
                Nome: utilizador.Nome,
                Email: utilizador.Email,
                ImagemPerfil: utilizador.ImagemPerfil
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