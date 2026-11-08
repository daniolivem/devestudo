import prisma from '../config/database.js';
import { verifyToken } from '../utils/jwt.js';

export async function forumAuthMiddleware(req, res, next) {
    const match = req.headers.authorization?.match(/^Bearer\s+(.+)$/i);
    if (!match) return res.status(401).json({ message: 'Token ausente ou inválido' });

    let payload;
    try {
        payload = verifyToken(match[1]);
    } catch {
        return res.status(401).json({ message: 'Token inválido ou expirado' });
    }

    if (typeof payload.id !== 'string' || !payload.id) {
        return res.status(401).json({ message: 'Token inválido' });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: payload.id },
            select: { id: true, name: true, email: true, role: true, photo: true, isBlocked: true },
        });
        if (!user) return res.status(401).json({ message: 'Usuário da sessão não existe' });
        if (user.isBlocked) return res.status(403).json({ message: 'Usuário bloqueado' });

        // Role and user identity come from the database, never from request data or JWT role claims.
        req.user = { id: user.id, name: user.name, email: user.email, role: user.role, photo: user.photo };
        return next();
    } catch (error) {
        return next(error);
    }
}
