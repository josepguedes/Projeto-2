const multer = require('multer');

const multerErrorHandler = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        switch (err.code) {
            case 'LIMIT_FILE_SIZE':
                return res.status(400).json({
                    error: 'Tamanho do arquivo muito grande. Máximo permitido: 5MB'
                });
            case 'LIMIT_FILE_COUNT':
                return res.status(400).json({
                    error: 'Número máximo de arquivos excedido'
                });
            case 'LIMIT_UNEXPECTED_FILE':
                return res.status(400).json({
                    error: 'Campo de arquivo inesperado'
                });
            default:
                return res.status(400).json({
                    error: 'Erro no upload do arquivo'
                });
        }
    }
    next(err);
};

module.exports = multerErrorHandler;