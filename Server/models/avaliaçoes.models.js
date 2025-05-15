module.exports = (sequelize, DataTypes) => {
    const Avaliacao = sequelize.define("Avaliacao", {
        IdAvaliacao: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        IdAnuncio: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        IdAutor: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        IdAvaliado: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        Comentario: {
            type: DataTypes.STRING,
            allowNull: false
        },
        DataAvaliacao: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        Classificacao: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }, {
        tableName: 'avaliacao',
        timestamps: false
    });
    return Avaliacao;
};