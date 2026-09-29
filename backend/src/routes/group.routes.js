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

router.get('/', authMiddleware, getGroups);
router.post('/', authMiddleware, authorizeRoles('MENTOR', 'ADMIN'), createGroup);
router.post('/participar', authMiddleware, joinGroup);
router.patch('/aprovar', authMiddleware, authorizeRoles('MENTOR', 'ADMIN'), approveGroupMember);

export default router;
