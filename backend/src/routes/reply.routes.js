import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import * as forum from '../controllers/thread.controller.js';
const router = Router();
router.use(authMiddleware);
router.delete('/:id', forum.deleteReply);
router.put('/:id/vote', forum.voteReply);
router.delete('/:id/vote', forum.unvoteReply);
export default router;
