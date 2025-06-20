const jwt = require('jsonwebtoken');

function autenticarJWT(req, res, next, needsAdmin = false) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: 'Token não fornecido.' });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.JWT_SECRET || 'segredo_super_secreto', (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Token inválido.' });
        }
        if (needsAdmin == true && user.Funcao !== 'admin') {
            return res.status(403).json({ message: 'Acesso negado. Apenas administradores.' });
        }
        req.user = user;
        next();
    });
}

module.exports = autenticarJWT;