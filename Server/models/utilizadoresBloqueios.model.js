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
      DataBloqueio: {
         type: DataTypes.DATE,
         allowNull: false,
         defaultValue: DataTypes.NOW
      }
   }, {
      tableName: 'utilizadores_bloqueados',
      timestamps: false
   });
   return UtilizadoresBloqueios;
};