module.exports = (sequelize, DataTypes) => {
    const EstadoAnuncio = sequelize.define("EstadoAnuncio", {
        IdEstadoAnuncio: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        EstadoAnuncio: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        tableName: 'estadoanuncio',
        timestamps: false
    });
    return EstadoAnuncio;
};