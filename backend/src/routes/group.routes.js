import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { authorizeRoles } from '../middlewares/role.middleware.js';
import {
    approveGroupMember,
    createGroup,
    deleteGroup,
    getGroups,
    joinGroup,
    leaveGroup,
    removeGroupMember,
    updateGroup,
} from '../controllers/group.controller.js';

const router = Router();

router.use(authMiddleware);

/**
 * @swagger
 * /api/groups:
 *   get:
 *     summary: Lista os grupos ativos
 *     tags: [Grupos]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: technology
 *         schema: { type: string }
 *       - in: query
 *         name: level
 *         schema: { type: string, enum: [Iniciante, Intermediário, Avançado] }
 *       - in: query
 *         name: availability
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Lista de grupos com criador e membros aprovados
 */
router.get('/', getGroups);

/**
 * @swagger
 * /api/groups:
 *   post:
 *     summary: Cria um grupo
 *     tags: [Grupos]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Group'
 *     responses:
 *       201: { description: Grupo criado }
 *       400: { description: Dados inválidos }
 *       403: { description: Apenas mentores e administradores }
 */
router.post('/', authorizeRoles('MENTOR', 'ADMIN'), createGroup);

/**
 * @swagger
 * /api/groups/participar:
 *   post:
 *     summary: Solicita entrada em um grupo
 *     tags: [Grupos]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GroupParticipation'
 *     responses:
 *       201: { description: Participação solicitada com status PENDING }
 *       404: { description: Grupo não encontrado }
 *       409: { description: Usuário já participa do grupo }
 */
router.post('/participar', joinGroup);
router.post('/join', joinGroup);

/**
 * @swagger
 * /api/groups/leave:
 *   post:
 *     summary: Sai de um grupo
 *     tags: [Grupos]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [groupId]
 *             properties:
 *               groupId: { type: string, format: uuid }
 *     responses:
 *       200: { description: Participação removida }
 *       404: { description: Participação não encontrada }
 */
router.post('/leave', leaveGroup);

/**
 * @swagger
 * /api/groups/aprovar:
 *   patch:
 *     summary: Aprova ou rejeita um membro do grupo
 *     tags: [Grupos]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GroupMemberApproval'
 *     responses:
 *       200: { description: Status do membro atualizado }
 *       403: { description: Apenas o mentor do grupo ou administrador }
 */
router.patch('/aprovar', authorizeRoles('MENTOR', 'ADMIN'), approveGroupMember);
router.patch('/approve', authorizeRoles('MENTOR', 'ADMIN'), approveGroupMember);
router.post('/approve', authorizeRoles('MENTOR', 'ADMIN'), approveGroupMember);

/**
 * @swagger
 * /api/groups/remove:
 *   post:
 *     summary: Remove um membro do grupo
 *     tags: [Grupos]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [groupId, memberId]
 *             properties:
 *               groupId: { type: string, format: uuid }
 *               memberId: { type: string, format: uuid }
 *     responses:
 *       200: { description: Membro removido }
 */
router.post('/remove', authorizeRoles('MENTOR', 'ADMIN'), removeGroupMember);
router.delete('/remove', authorizeRoles('MENTOR', 'ADMIN'), removeGroupMember);

/**
 * @swagger
 * /api/groups/{id}:
 *   put:
 *     summary: Atualiza um grupo do mentor autenticado (ou qualquer grupo para ADMIN)
 *     tags: [Grupos]
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
 *             $ref: '#/components/schemas/Group'
 *     responses:
 *       200: { description: Grupo atualizado }
 *       403: { description: Sem permissão }
 *       404: { description: Grupo não encontrado }
 *   delete:
 *     summary: Exclui um grupo do mentor autenticado (ou qualquer grupo para ADMIN)
 *     tags: [Grupos]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Grupo removido }
 *       403: { description: Sem permissão }
 *       404: { description: Grupo não encontrado }
 */
router.put('/:id', authorizeRoles('MENTOR', 'ADMIN'), updateGroup);
router.patch('/:id', authorizeRoles('MENTOR', 'ADMIN'), updateGroup);
router.delete('/:id', authorizeRoles('MENTOR', 'ADMIN'), deleteGroup);

export default router;
