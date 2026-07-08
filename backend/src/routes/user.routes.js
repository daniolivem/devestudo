import { Router } from 'express';
import { getAllUsers } from '../controllers/user.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { authorizeRoles } from '../middlewares/role.middleware.js';

const router = Router();

router.get('/', authMiddleware, authorizeRoles('ADMIN'), getAllUsers);

export default router;
