import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { authorizeRoles } from '../middlewares/role.middleware.js';
import {
    createCategory,
    deleteCategory,
    getCategories,
    updateCategory,
} from '../controllers/category.controller.js';

const router = Router();

router.get('/', authMiddleware, authorizeRoles('ADMIN'), getCategories);
router.post('/', authMiddleware, authorizeRoles('ADMIN'), createCategory);
router.put('/:id', authMiddleware, authorizeRoles('ADMIN'), updateCategory);
router.delete('/:id', authMiddleware, authorizeRoles('ADMIN'), deleteCategory);

export default router;
