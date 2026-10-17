import { Router } from 'express';
import { getAllUsers } from '../controllers/user.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { authorizeRoles } from '../middlewares/role.middleware.js';

const router = Router();

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Lista todos os usuarios
 *     tags: [Usuarios]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *       401:
 *         description: Token ausente ou invalido
 *       403:
 *         description: Apenas administradores podem acessar
 */
router.get('/', authMiddleware, authorizeRoles('ADMIN'), getAllUsers);

export default router;