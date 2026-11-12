import { Router } from 'express';
import { forumAuthMiddleware } from '../middlewares/forum-auth.middleware.js';
import { authorizeRoles } from '../middlewares/role.middleware.js';
import * as forum from '../controllers/thread.controller.js';
const router = Router();
router.use(forumAuthMiddleware, authorizeRoles('STUDENT', 'MENTOR', 'ADMIN'));

/**
 * @swagger
 * /api/replies/{id}:
 *   delete:
 *     summary: Exclui uma resposta
 *     tags: [Fórum]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Resposta excluída }
 *       401: { description: Token ausente ou inválido }
 *       403: { description: Apenas o autor ou um administrador pode excluir }
 *       404: { description: Resposta não encontrada }
 * /api/replies/{id}/vote:
 *   post:
 *     summary: Alias de compatibilidade para votar na resposta
 *     description: Mesmo comportamento de PUT /api/replies/{id}/vote.
 *     tags: [Fórum]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Voto registrado e contagem atualizada retornada }
 *       401: { description: Token ausente ou inválido }
 *       404: { description: Resposta não encontrada }
 *   put:
 *     summary: Vota na resposta autenticada
 *     tags: [Fórum]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Voto registrado; contagem atualizada retornada; votos duplicados são impedidos }
 *       401: { description: Token ausente ou inválido }
 *       404: { description: Resposta não encontrada }
 *   delete:
 *     summary: Remove o voto do usuário autenticado na resposta
 *     tags: [Fórum]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Voto removido; contagem atualizada retornada }
 *       401: { description: Token ausente ou inválido }
 *       404: { description: Resposta não encontrada }
 */
router.delete('/:id', forum.deleteReply);
router.put('/:id/vote', forum.voteReply);
router.post('/:id/vote', forum.voteReply);
router.delete('/:id/vote', forum.unvoteReply);
export default router;
