module.exports = (sequelize, DataTypes) => {
    return sequelize.define("NotificacaoUtilizador", {
        IdUtilizador: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false
        },
        IdNotificacao: {
            type: DataTypes.INTEGER,
            primaryKey: true,
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
