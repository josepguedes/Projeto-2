module.exports = (sequelize, DataTypes) => {
  const AdminBloqueio = sequelize.define("AdminBloqueio", {
    IdAdminBloqueados: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    IdBloqueado: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    DataBloqueio: {
      type: DataTypes.DATE,
      allowNull: false
    },
    DataFimBloqueio: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'admin_bloqueados',
    timestamps: false
  });

  return AdminBloqueio;
};