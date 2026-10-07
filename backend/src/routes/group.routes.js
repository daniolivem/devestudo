import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { authorizeRoles } from '../middlewares/role.middleware.js';
import {
    approveGroupMember,
    createGroup,
    getGroups,
    joinGroup,
} from '../controllers/group.controller.js';

const router = Router();

/**
 * @swagger
 * /api/groups:
 *   get:
 *     summary: Lista os grupos
 *     tags: [Grupos]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Lista de grupos
 */
router.get('/', authMiddleware, getGroups);

/**
 * @swagger
 * /api/groups:
 *   post:
 *     summary: Cria um grupo
 *     tags: [Grupos]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201:
 *         description: Grupo criado
 */
router.post('/', authMiddleware, authorizeRoles('MENTOR', 'ADMIN'), createGroup);

/**
 * @swagger
 * /api/groups/participar:
 *   post:
 *     summary: Participa de um grupo
 *     tags: [Grupos]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Participacao solicitada
 */
router.post('/participar', authMiddleware, joinGroup);

/**
 * @swagger
 * /api/groups/aprovar:
 *   patch:
 *     summary: Aprova um membro do grupo
 *     tags: [Grupos]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Membro aprovado
 */
router.patch('/aprovar', authMiddleware, authorizeRoles('MENTOR', 'ADMIN'), approveGroupMember);

export default router;
