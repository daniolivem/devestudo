import { Router } from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import profileRoutes from './profile.routes.js';
import mentorRoutes from './mentor.routes.js';
import groupRoutes from './group.routes.js';
import mentorshipRoutes from './mentorship.routes.js';
import categoryRoutes from './category.routes.js';
import threadRoutes from './thread.routes.js';
import replyRoutes from './reply.routes.js';
import forumCompatRoutes from './forum-compat.routes.js';
import mentorshipCompatRoutes from './mentorship-compat.routes.js';

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

// Compatibility route documented in the Sprint 4 checklist: POST /api/mentorias/avaliar
router.use('/', mentorshipCompatRoutes);

// Category routes
router.use('/categories', categoryRoutes);
// Forum API: topics and topic replies share the /threads route tree;
// reply deletion and reply voting are exposed under /replies.
router.use('/threads', threadRoutes);
router.use('/replies', replyRoutes);

// Compatibility routes documented in the project README.
router.use('/', forumCompatRoutes);

export default router;
