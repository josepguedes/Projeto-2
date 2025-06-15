module.exports = (sequelize, DataTypes) => {
    const Notificacao = sequelize.define("Notificacao", {
        IdNotificacao: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        Mensagem: {
            type: DataTypes.STRING,
            allowNull: false
        },
        DataNotificacao: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        HoraNotificacao: {
            type: DataTypes.TIME,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        IdRecipiente: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
    }, {
        tableName: 'notificacao',
        timestamps: false
    });

    return Notificacao;
};