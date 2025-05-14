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
         references: {
            model: 'Utilizador',
            key: 'id'
         }
      },
      IdUtilizadorReserva: {
         type: DataTypes.INTEGER,
         references: {
            model: 'Utilizador',
            key: 'id'
         }
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
         references: {
            model: 'EstadoAnuncio',
            key: 'id'
         }
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
      IdProdutoCat: {  // This is defined as IdProdutoCat
         type: DataTypes.INTEGER,
         allowNull: false,
         references: {
            model: 'ProdutoCategoria',
            key: 'id'
         }
      },
      DataReserva: {
         type: DataTypes.DATE
      },
      ImagemAnuncio: {
         type: DataTypes.STRING
      },
      CodigoVerificacao: {
         type: DataTypes.STRING
      }
   }, {
      tableName: 'anuncio',
      timestamps: false // se não precisar de createdAt e updatedAt
   });

   Anuncio.associate = (models) => {
      // Definir as relações aqui
      Anuncio.belongsTo(models.Utilizador, {
         as: 'Anunciante',
         foreignKey: 'IdUtilizadorAnuncio'  
      });
      Anuncio.belongsTo(models.Utilizador, {
         as: 'Recolhedor',
         foreignKey: 'IdUtilizadorReserva' 
      });
      Anuncio.belongsTo(models.EstadoAnuncio, {
         foreignKey: 'IdEstadoAnuncio'
      });
      Anuncio.belongsTo(models.ProdutoCategoria, {
         foreignKey: 'IdProdutoCategoria'  
      });
   };
   return Anuncio;
};