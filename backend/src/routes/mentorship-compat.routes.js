import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { authorizeRoles } from '../middlewares/role.middleware.js';
import { evaluateMentorshipFromBody } from '../controllers/mentorship.controller.js';

const router = Router();

const authAndRoles = [authMiddleware, authorizeRoles('STUDENT', 'MENTOR', 'ADMIN')];

/**
 * @swagger
 * /api/mentorias/avaliar:
 *   post:
 *     summary: Avalia uma mentoria (rota de compatibilidade da Sprint 4)
 *     description: >
 *       Aceita mentorshipId (ou id) e rating/comment. Se mentorshipId não for
 *       informado, aceita mentorId e avalia a mentoria elegível do aluno.
 *     tags: [Mentorias]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               mentorshipId: { type: string, format: uuid }
 *               mentorId: { type: string, format: uuid }
 *               rating: { type: integer, minimum: 1, maximum: 5 }
 *               comment: { type: string, maxLength: 255 }
 *     responses:
 *       200: { description: Mentoria avaliada }
 *       400: { description: Nota inválida }
 *       403: { description: Usuário não participa da mentoria }
 *       404: { description: Mentoria não encontrada }
 */
router.post('/mentorias/avaliar', ...authAndRoles, evaluateMentorshipFromBody);

// Alias previsto na documentação original do projeto.
router.post('/toevaluate', ...authAndRoles, evaluateMentorshipFromBody);

export default router;
