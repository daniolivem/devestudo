import { verifyToken } from '../utils/jwt.js';

export function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: 'Token não informado' });
    }

    const [, token] = authHeader.split(' ');

    if (!token) {
        return res.status(401).json({ message: 'Token inválido' });
    }

    try {
        const decoded = verifyToken(token);

        req.user = decoded;

        return next();
    } catch (error) {
        return res.status(401).json({ message: 'Token inválido ou expirado' });
    }
}