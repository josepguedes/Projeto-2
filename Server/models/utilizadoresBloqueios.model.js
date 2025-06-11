module.exports = (sequelize, DataTypes) => {
   const UtilizadoresBloqueios = sequelize.define("UtilizadoresBloqueios", {
      IdUtilizadoresBloqueados: {
         type: DataTypes.INTEGER,
         primaryKey: true,
         autoIncrement: true
      },
      IdBloqueador: {
         type: DataTypes.INTEGER,
         allowNull: false,
      },
      IdBloqueado: {
         type: DataTypes.INTEGER,
         allowNull: false,
      },
   }, {
      tableName: 'utilizadores_bloqueados', // nome da tabela no banco de dados
      timestamps: false // se não precisar de createdAt e updatedAt
   });
   return UtilizadoresBloqueios;
};