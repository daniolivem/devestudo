import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { getProfile, updateProfile, changePassword } from '../controllers/user.controller.js';

const router = Router();

/**
 * @swagger
 * /api/profile:
 *   get:
 *     summary: Consulta o perfil do usuario autenticado
 *     tags: [Perfil]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Perfil do usuario
 */
router.get('/', authMiddleware, getProfile);

/**
 * @swagger
 * /api/profile:
 *   put:
 *     summary: Atualiza o perfil do usuario autenticado
 *     tags: [Perfil]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProfileUpdate'
 *     responses:
 *       200:
 *         description: Perfil atualizado
 */
router.put('/', authMiddleware, updateProfile);

/**
 * @swagger
 * /api/profile/password:
 *   put:
 *     summary: Altera a senha do usuario autenticado
 *     tags: [Perfil]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangePassword'
 *     responses:
 *       200:
 *         description: Senha alterada
 */
router.put('/password', authMiddleware, changePassword);

export default router;