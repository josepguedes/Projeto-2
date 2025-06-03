module.exports = (sequelize, DataTypes) => {
   const Anuncio = sequelize.define("Anuncio", {
      IdAnuncio: {
         type: DataTypes.INTEGER,
         primaryKey: true,
         autoIncrement: true
      },
      IdUtilizadorAnuncio: {
         type: DataTypes.INTEGER,
         allowNull: false,
      },
      IdUtilizadorReserva: {
         type: DataTypes.INTEGER,
      },
      DataAnuncio: {
         type: DataTypes.DATE,
         allowNull: false,
         defaultValue: DataTypes.NOW
      },
      LocalRecolha: {
         type: DataTypes.STRING,
         allowNull: false
      },
      HorarioRecolha: {
         type: DataTypes.STRING,
         allowNull: false
      },
      Preco: {
         type: DataTypes.DECIMAL(10, 2),
         allowNull: false
      },
      DataRecolha: {
         type: DataTypes.DATE
      },
      IdEstadoAnuncio: {
         type: DataTypes.INTEGER,
         allowNull: false,
      },
      Nome: {
         type: DataTypes.STRING,
         allowNull: false
      },
      Descricao: {
         type: DataTypes.TEXT
      },
      DataValidade: {
         type: DataTypes.DATE,
         allowNull: false
      },
      Quantidade: {
         type: DataTypes.INTEGER,
         allowNull: false
      },
      IdProdutoCategoria: {  // This is defined as IdProdutoCat
         type: DataTypes.INTEGER,
         allowNull: false
      },
      DataReserva: {
         type: DataTypes.DATE
      },
      ImagemAnuncio: {
         type: DataTypes.STRING
      },
      CodigoVerificacao: {
         type: DataTypes.STRING
      },
      CloudinaryId: {
         type: DataTypes.STRING,
         allowNull: true
      }
   }, {
      tableName: 'anuncio',
      timestamps: false // se não precisar de createdAt e updatedAt
   });
   return Anuncio;
};