const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
    process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: process.env.DB_DIALECT,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

// test the connection to the database
(async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection to the database has been established successfully.');

        // Sync all models
        await sequelize.sync({ alter: true }); // Use { force: true } only in development
        console.log('Database synchronized');
    } catch (error) {
        console.error('❌ Unable to connect to the database:', error);
        process.exit(1);
    }
})();



const db = {};
db.sequelize = sequelize;

db.Anuncio = require('./anuncios.model.js')(sequelize, Sequelize.DataTypes);
db.Denuncia = require('./denuncias.models.js')(sequelize, Sequelize.DataTypes);
db.Avaliacao = require('./avaliaçoes.models')(sequelize, Sequelize.DataTypes);
db.Utilizador = require('./utilizador.models.js')(sequelize, Sequelize.DataTypes);
db.EstadoAnuncio = require('./estadoAnuncio.models.js')(sequelize, Sequelize.DataTypes);
db.Notificacao = require('./notificacoes.models.js')(sequelize, Sequelize.DataTypes);
db.ProdutoCategoria = require('./produtoCategoria.models.js')(sequelize, Sequelize.DataTypes);
db.Mensagem = require('./mensagens.models.js')(sequelize, Sequelize.DataTypes);
db.UtilizadorBloqueio = require("./utilizadoresBloqueios.model.js")(sequelize, Sequelize.DataTypes);
db.AdminBloqueio = require("./adminBloqueios.model.js")(sequelize, Sequelize.DataTypes);
db.NotificacaoUtilizador = require('./notificacoesUtilizador.models.js')(sequelize, Sequelize.DataTypes);

db.Anuncio.belongsTo(db.Utilizador, {
    foreignKey: 'IdUtilizadorAnuncio',
    as: 'utilizador',
    attributes: ['Nome', 'ImagemPerfil', 'Classificacao']
});

db.Anuncio.belongsTo(db.Utilizador, {
    as: "reservador",
    foreignKey: "IdUtilizadorReserva"
});

db.Avaliacao.belongsTo(db.Utilizador, {
    foreignKey: 'IdAutor',
    as: 'autor'
});

db.Anuncio.belongsTo(db.EstadoAnuncio, {
    foreignKey: 'IdEstadoAnuncio',
    as: 'estado'
});

db.Denuncia.belongsTo(db.Anuncio, {
    foreignKey: 'IdAnuncio',
    as: 'anuncio'
});

// Add this association
db.Notificacao.belongsToMany(db.Utilizador, {
    through: db.NotificacaoUtilizador,
    foreignKey: 'IdNotificacao',
    otherKey: 'IdUtilizador',
    as: 'utilizadores'
});
db.Utilizador.belongsToMany(db.Notificacao, {
    through: db.NotificacaoUtilizador,
    foreignKey: 'IdUtilizador',
    otherKey: 'IdNotificacao',
    as: 'notificacoes'
});

db.NotificacaoUtilizador.belongsTo(db.Notificacao, { 
    foreignKey: 'IdNotificacao', 
    as: 'notificacao' 
});

db.NotificacaoUtilizador.belongsTo(db.Utilizador, { 
    foreignKey: 'IdUtilizador', 
    as: 'utilizador' 
});

db.Notificacao.belongsTo(db.Utilizador, { 
    foreignKey: 'IdRecipiente', 
    as: 'recipiente' 
});

db.ProdutoCategoria.hasMany(db.Anuncio, {
    foreignKey: 'IdProdutoCategoria',
    as: 'anuncios'
});

db.Anuncio.belongsTo(db.ProdutoCategoria, {
    foreignKey: 'IdProdutoCategoria',
    as: 'categoria'
});

db.Mensagem.belongsTo(db.Utilizador, {
    foreignKey: 'IdRemetente',
    as: 'remetente'
});

db.Mensagem.belongsTo(db.Utilizador, {
    foreignKey: 'IdDestinatario',
    as: 'destinatario'
});

db.UtilizadorBloqueio.belongsTo(db.Utilizador, {
    foreignKey: 'IdBloqueador',
    as: 'bloqueador'
});
db.UtilizadorBloqueio.belongsTo(db.Utilizador, {
    foreignKey: 'IdBloqueado',
    as: 'bloqueado'
});

db.AdminBloqueio.belongsTo(db.Utilizador, {
    foreignKey: 'IdBloqueado',
    as: 'utilizadorBloqueado'
});

module.exports = db;