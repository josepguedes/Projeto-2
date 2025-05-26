module.exports = (sequelize, DataTypes) => {
    const Mensagem = sequelize.define("Mensagem", {
        IdMensagem: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        IdRemetente: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        IdDestinatario: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        Conteudo: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        DataEnvio: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        HoraEnvio: {
            type: DataTypes.TIME,
            allowNull: false,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'mensagem',
        timestamps: false
    });
    return Mensagem;
};