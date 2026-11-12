import { Router } from 'express';
import {
    createUserByAdmin,
    deleteUserByAdmin,
    getAllUsers,
    updateUserByAdmin,
} from '../controllers/user.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { authorizeRoles } from '../middlewares/role.middleware.js';

const router = Router();

router.use(authMiddleware, authorizeRoles('ADMIN'));

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
router.get('/', getAllUsers);

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Cadastra um usuario (administrador)
 *     tags: [Usuarios]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdminUserInput'
 *     responses:
 *       201: { description: Usuario criado }
 *       400: { description: Dados invalidos }
 *       409: { description: E-mail ja cadastrado }
 */
router.post('/', createUserByAdmin);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Atualiza nome, e-mail, role ou bloqueio de um usuario
 *     tags: [Usuarios]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdminUserUpdate'
 *     responses:
 *       200: { description: Usuario atualizado }
 *       404: { description: Usuario nao encontrado }
 *   delete:
 *     summary: Exclui um usuario
 *     tags: [Usuarios]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Usuario removido }
 *       400: { description: Nao e possivel excluir a propria conta }
 *       404: { description: Usuario nao encontrado }
 */
router.put('/:id', updateUserByAdmin);
router.patch('/:id', updateUserByAdmin);
router.delete('/:id', deleteUserByAdmin);

export default router;
