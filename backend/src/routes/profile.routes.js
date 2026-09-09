import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { getProfile, updateProfile, changePassword } from '../controllers/user.controller.js';

const router = Router();

router.get('/', authMiddleware, getProfile);
router.put('/', authMiddleware, updateProfile);
router.put('/password', authMiddleware, changePassword);

export default router;