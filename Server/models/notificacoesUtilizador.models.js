module.exports = (sequelize, DataTypes) => {
    return sequelize.define("NotificacaoUtilizador", {
        IdNotificacaoUtilizador: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        IdUtilizador: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        IdNotificacao: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        DataRececao: {
            type: DataTypes.DATE,
            allowNull: true
        }
    }, {
        tableName: 'NotificacaoUtilizador',
        timestamps: false
    });
};