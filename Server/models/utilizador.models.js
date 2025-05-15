module.exports = (sequelize, DataTypes) => {
    const Utilizador = sequelize.define("Utilizador", {
        IdUtilizador: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        IdEndereco: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        Nome: {
            type: DataTypes.STRING,
            allowNull: false
        },
        Nif: {
            type: DataTypes.INTEGER,
            allowNull: true,
            unique: true,
        },
        DataNascimento: {
            type: DataTypes.DATE,
            allowNull: true
        },
        Email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            }
        },
        Password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        DataRegisto: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        Classificacao: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0
        },
        Funcao: {
            type: DataTypes.ENUM('user', 'admin'),
            allowNull: false,
            defaultValue: 'user'
        },
        ImagemPerfil: {
            type: DataTypes.STRING,
            allowNull: true
        },
    }, {
        tableName: 'utilizador',
        timestamps: false
    });
    return Utilizador;
};