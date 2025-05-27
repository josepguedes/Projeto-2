module.exports = (sequelize, DataTypes) => {
    const ProdutoCategoria = sequelize.define("ProdutoCategoria", {
        IdProdutoCategoria: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        NomeCategoria: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        tableName: 'produtocategoria',
        timestamps: false
    });

    return ProdutoCategoria;
};