import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
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
 *         description: Lista de categorias
 */
router.get('/', authMiddleware, getCategories);

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
router.post('/', authMiddleware, authorizeRoles('MENTOR', 'ADMIN'), createCategory);

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
router.put('/:id', authMiddleware, authorizeRoles('ADMIN'), updateCategory);

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
router.delete('/:id', authMiddleware, authorizeRoles('ADMIN'), deleteCategory);

export default router;
