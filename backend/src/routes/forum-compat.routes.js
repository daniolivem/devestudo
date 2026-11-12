import { Router } from 'express';
import { forumAuthMiddleware } from '../middlewares/forum-auth.middleware.js';
import { authorizeRoles } from '../middlewares/role.middleware.js';
import { createReplyFromBody, voteFromBody } from '../controllers/thread.controller.js';

const router = Router();

const authAndRoles = [forumAuthMiddleware, authorizeRoles('STUDENT', 'MENTOR', 'ADMIN')];

/**
 * @swagger
 * /api/reply:
 *   post:
 *     summary: Cria uma resposta (rota de compatibilidade)
 *     description: >
 *       Mantida para compatibilidade com a documentação original do projeto.
 *       Prefira POST /api/threads/{id}/replies ou POST /api/threads/{id}/respostas.
 *     tags: [Fórum]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [threadId, content]
 *             properties:
 *               threadId: { type: string, format: uuid }
 *               content: { type: string }
 *     responses:
 *       201:
 *         description: Resposta criada; o autor é obtido do token.
 *       400: { description: Dados inválidos }
 *       401: { description: Token ausente ou inválido }
 *       404: { description: Tópico não encontrado }
 */
router.post('/reply', ...authAndRoles, createReplyFromBody);

/**
 * @swagger
 * /api/vote:
 *   post:
 *     summary: Vota em um tópico ou resposta (rota de compatibilidade)
 *     description: >
 *       Mantida para compatibilidade com a documentação original do projeto.
 *       Informe threadId para votar em um tópico ou replyId para votar em uma resposta.
 *       Prefira POST/PUT /api/threads/{id}/vote e POST/PUT /api/replies/{id}/vote.
 *     tags: [Fórum]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               threadId: { type: string, format: uuid }
 *               replyId: { type: string, format: uuid }
 *             example:
 *               threadId: 00000000-0000-0000-0000-000000000000
 *     responses:
 *       200:
 *         description: Voto registrado e contagem atualizada retornada.
 *       400: { description: Informe threadId ou replyId }
 *       401: { description: Token ausente ou inválido }
 *       404: { description: Tópico ou resposta não encontrado }
 */
router.post('/vote', ...authAndRoles, voteFromBody);

export default router;
