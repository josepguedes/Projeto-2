module.exports = (sequelize, DataTypes) => {
    const Denuncia = sequelize.define("Denuncia", {
        IdDenuncia: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        IdUtilizadorDenunciado: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        DataDenuncia: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        Motivo: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        tableName: 'denuncia',
        timestamps: false
    });
    return Denuncia;
}