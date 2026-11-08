import { Router } from 'express';
import { forumAuthMiddleware } from '../middlewares/forum-auth.middleware.js';
import { authorizeRoles } from '../middlewares/role.middleware.js';
import {
    createCategory,
    deleteCategory,
    getCategories,
    updateCategory,
} from '../controllers/category.controller.js';

const router = Router();

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Lista as categorias
 *     tags: [Categorias]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Categorias disponíveis para as tags dos tópicos.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id: { type: string, format: uuid }
 *                   name: { type: string }
 *       401: { description: Token ausente ou inválido }
 */
router.get('/', forumAuthMiddleware, getCategories);

/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: Cria uma categoria
 *     tags: [Categorias]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Category'
 *     responses:
 *       201:
 *         description: Categoria criada
 */
router.post('/', forumAuthMiddleware, authorizeRoles('MENTOR', 'ADMIN'), createCategory);

/**
 * @swagger
 * /api/categories/{id}:
 *   put:
 *     summary: Atualiza uma categoria
 *     tags: [Categorias]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Category'
 *     responses:
 *       200:
 *         description: Categoria atualizada
 */
router.put('/:id', forumAuthMiddleware, authorizeRoles('ADMIN'), updateCategory);

/**
 * @swagger
 * /api/categories/{id}:
 *   delete:
 *     summary: Exclui uma categoria
 *     tags: [Categorias]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Categoria excluida
 */
router.delete('/:id', forumAuthMiddleware, authorizeRoles('ADMIN'), deleteCategory);

export default router;
