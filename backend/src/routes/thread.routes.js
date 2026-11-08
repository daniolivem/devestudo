import { Router } from 'express';
import { forumAuthMiddleware } from '../middlewares/forum-auth.middleware.js';
import { authorizeRoles } from '../middlewares/role.middleware.js';
import * as forum from '../controllers/thread.controller.js';
const router = Router();
router.use(forumAuthMiddleware, authorizeRoles('STUDENT', 'MENTOR', 'ADMIN'));

/**
 * @swagger
 * /api/threads:
 *   get:
 *     summary: Lista tópicos do fórum
 *     tags: [Fórum]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Busca no título e conteúdo (também aceita q).
 *       - in: query
 *         name: tag
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 100, default: 10 }
 *       - in: query
 *         name: sort
 *         schema: { type: string, enum: [recent, oldest, votes, replies], default: recent }
 *     responses:
 *       200:
 *         description: Página de tópicos; author e hasVoted refletem o usuário autenticado.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ForumThreadPage' }
 *       401: { description: Token ausente ou inválido }
 *       403: { description: Perfil sem permissão para acessar o fórum }
 *   post:
 *     summary: Cria tópico
 *     tags: [Fórum]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ForumThreadInput' }
 *     responses:
 *       201:
 *         description: Tópico criado; o autor é obtido do token.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ForumThread' }
 *       400: { description: Dados inválidos }
 *       401: { description: Token ausente ou inválido }
 */
router.get('/', forum.listThreads);
router.post('/', forum.createThread);

/**
 * @swagger
 * /api/threads/{id}:
 *   get:
 *     summary: Busca tópico por ID com respostas
 *     tags: [Fórum]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Detalhe do tópico; replies é uma lista e repliesCount é a contagem.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ForumThreadDetail' }
 *       401: { description: Token ausente ou inválido }
 *       404: { description: Tópico não encontrado }
 *   patch:
 *     summary: Atualiza título, conteúdo e/ou tags do tópico
 *     tags: [Fórum]
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
 *           schema: { $ref: '#/components/schemas/ForumThreadPatch' }
 *     responses:
 *       200:
 *         description: Tópico atualizado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ForumThread' }
 *       400: { description: Dados inválidos }
 *       401: { description: Token ausente ou inválido }
 *       403: { description: Apenas o autor ou um administrador pode editar }
 *       404: { description: Tópico não encontrado }
 *   delete:
 *     summary: Exclui tópico e conteúdo relacionado
 *     tags: [Fórum]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Tópico excluído }
 *       401: { description: Token ausente ou inválido }
 *       403: { description: Apenas o autor ou um administrador pode excluir }
 *       404: { description: Tópico não encontrado }
 * /api/threads/{id}/replies:
 *   get:
 *     summary: Lista respostas do tópico com paginação
 *     tags: [Fórum]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 100, default: 10 }
 *     responses:
 *       200:
 *         description: Página de respostas
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ForumReplyPage' }
 *       401: { description: Token ausente ou inválido }
 *       404: { description: Tópico não encontrado }
 *   post:
 *     summary: Cria resposta no tópico
 *     tags: [Fórum]
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
 *           schema: { $ref: '#/components/schemas/ForumReplyInput' }
 *     responses:
 *       201:
 *         description: Resposta criada; o autor é obtido do token.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ForumReply' }
 *       400: { description: Conteúdo inválido }
 *       401: { description: Token ausente ou inválido }
 *       404: { description: Tópico não encontrado }
 */
router.get('/:id/replies', forum.listReplies);
router.get('/:id', forum.getThread);
router.patch('/:id', forum.updateThread);
router.delete('/:id', forum.deleteThread);
router.post('/:id/replies', forum.createReply);

/**
 * @swagger
 * /api/threads/{id}/vote:
 *   put:
 *     summary: Vota no tópico autenticado
 *     tags: [Fórum]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Voto registrado; votos duplicados são impedidos }
 *       401: { description: Token ausente ou inválido }
 *       404: { description: Tópico não encontrado }
 *   delete:
 *     summary: Remove o voto do usuário autenticado no tópico
 *     tags: [Fórum]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Voto removido }
 *       401: { description: Token ausente ou inválido }
 *       404: { description: Tópico não encontrado }
 */
router.put('/:id/vote', forum.voteThread);
router.delete('/:id/vote', forum.unvoteThread);
export default router;
