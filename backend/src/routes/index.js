import { Router } from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import profileRoutes from './profile.routes.js';
import mentorRoutes from './mentor.routes.js';
import groupRoutes from './group.routes.js';
import mentorshipRoutes from './mentorship.routes.js';
import categoryRoutes from './category.routes.js';

const router = Router();

/**
 * @swagger
 * /api:
 *   get:
 *     summary: Verifica se a API esta funcionando
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API funcionando
 */
router.get('/', (req, res) => {
    return res.status(200).json({ message: 'API working' });
});

// User routes
router.use('/users', userRoutes);

// Authentication routes
router.use('/auth', authRoutes);

// Profile routes
router.use('/profile', profileRoutes);

// Mentor routes
router.use('/mentors', mentorRoutes);

// Group routes
router.use('/groups', groupRoutes);

// Mentorship routes
router.use('/mentorships', mentorshipRoutes);

// Category routes
router.use('/categories', categoryRoutes);

export default router;