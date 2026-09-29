import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { authorizeRoles } from '../middlewares/role.middleware.js';
import {
    createMentorshipRequest,
    evaluateMentorship,
    getMentorships,
    updateMentorshipStatus,
} from '../controllers/mentorship.controller.js';

const router = Router();

router.get('/', authMiddleware, getMentorships);
router.post('/', authMiddleware, authorizeRoles('STUDENT'), createMentorshipRequest);
router.patch('/:id/status', authMiddleware, updateMentorshipStatus);
router.post('/:id/avaliar', authMiddleware, evaluateMentorship);
router.post('/avaliar', authMiddleware, (req, res, next) => {
    req.params.id = req.body.mentorshipId;
    return evaluateMentorship(req, res, next);
});

export default router;
