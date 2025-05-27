const express = require('express');
const cors = require('cors');

// read environment variables from .env file
require('dotenv').config();

const app = express();
const port = process.env.PORT;	// use environment variables
const host = process.env.HOST;


app.use(cors());
app.use(express.json());

// middleware for ALL routes
app.use((req, res, next) => {
    const start = Date.now();
    res.on("finish", () => { // finish event is emitted once the response is sent to the client
        const diffSeconds = (Date.now() - start) / 1000; // figure out how many seconds elapsed
        console.log(`Request: ${req.method} ${req.originalUrl} completed in ${diffSeconds} seconds`);
    });
    next()
})


// middleware for CORS (Cross-Origin Resource Sharing)
app.use('/anuncios', require('./routes/anuncios.routes.js'));
app.use('/denuncias', require('./routes/denuncias.routes.js'));
app.use('/avaliacoes', require('./routes/avaliacoes.routes.js'));
app.use('/utilizadores', require('./routes/utilizadores.routes.js'));
app.use('/notificacoes', require('./routes/notificacoes.routes.js'));
app.use('/mensagens', require('./routes/mensagens.routes.js'));
app.use('/categorias', require('./routes/produtoCategoria.routes.js'));


//handle invalid routes (404)    
app.use((req, res, next) => {
    res.status(404).json({ message: `The requested resource was not found: ${req.method} ${req.originalUrl}` });
});


// error middleware (always at the end of the file)
app.use((err, req, res, next) => {
    // !Uncomment this line to log the error details to the server console!
    console.error(err);

    // error thrown by express.json() middleware when the request body is not valid JSON
    if (err.type === 'entity.parse.failed')
        return res.status(400).json({ error: 'Invalid JSON payload! Check if your body data is a valid JSON.' });

    // Sequelize validation errors (ALL models)
    if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({
            error: 'Validation error',
            details: err.errors.map(e => ({
                field: e.path,
                message: e.message
            }))
        });
    }

    // SequelizeDatabaseError related to an invalid ENUM value (USERS table -> role field)
    if (err.name === 'SequelizeDatabaseError') {
        if (err.original.code === 'ER_CHECK_CONSTRAINT_VIOLATED') {
            return res.status(400).json({
                error: 'Invalid value for enumerated field',
                message: err.message
            });
        }
        if (err.original.code === 'ER_BAD_NULL_ERROR') {
            return res.status(400).json({
                error: 'Missing mandatory field',
                message: err.message
            });
        }
        if (err.original.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({
                error: 'Duplicate entry',
                message: err.message
            });
        }
    }
    // other errors
    res.status(err.statusCode || 500).json({ error: err.message || 'Internal Server Error' });
});

app.listen(port, host, () => {
    console.log(`App listening at http://${host}:${port}/`);
});