import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { authorizeRoles } from '../middlewares/role.middleware.js';
import {
    createMentorshipRequest,
    evaluateMentorship,
    getMentorships,
    updateMentorshipStatus,
} from '../controllers/mentorship.controller.js';

const router = Router();

/**
 * @swagger
 * /api/mentorships:
 *   get:
 *     summary: Lista as mentorias
 *     tags: [Mentorias]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Lista de mentorias
 */
router.get('/', authMiddleware, getMentorships);

/**
 * @swagger
 * /api/mentorships:
 *   post:
 *     summary: Solicita uma mentoria
 *     tags: [Mentorias]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MentorshipRequest'
 *     responses:
 *       201:
 *         description: Mentoria solicitada
 */
router.post('/', authMiddleware, authorizeRoles('STUDENT'), createMentorshipRequest);

/**
 * @swagger
 * /api/mentorships/{id}/status:
 *   patch:
 *     summary: Atualiza o status de uma mentoria
 *     tags: [Mentorias]
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
 *             $ref: '#/components/schemas/MentorshipStatus'
 *     responses:
 *       200:
 *         description: Status atualizado
 *       403:
 *         description: Apenas o mentor pode aprovar a mentoria
 */
router.patch('/:id/status', authMiddleware, updateMentorshipStatus);

/**
 * @swagger
 * /api/mentorships/{id}/avaliar:
 *   post:
 *     summary: Avalia uma mentoria pelo id da URL
 *     tags: [Mentorias]
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
 *             $ref: '#/components/schemas/MentorshipRating'
 *     responses:
 *       200:
 *         description: Mentoria avaliada
 */
router.post('/:id/avaliar', authMiddleware, evaluateMentorship);

/**
 * @swagger
 * /api/mentorships/avaliar:
 *   post:
 *     summary: Avalia uma mentoria pelo id enviado no corpo
 *     tags: [Mentorias]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MentorshipRating'
 *     responses:
 *       200:
 *         description: Mentoria avaliada
 */
router.post('/avaliar', authMiddleware, (req, res, next) => {
    req.params.id = req.body.mentorshipId;
    return evaluateMentorship(req, res, next);
});

export default router;
