import { Router } from 'express';
import { authMiddleware} from '../middlewares/auth.middleware.js';
import {authorizeRoles } from '../middlewares/role.middleware.js';
import { 
    getMentors, 
    updateMentorProfile 
} from '../controllers/mentor.controller.js';


const router = Router();

router.get(
    '/', 
    authMiddleware, 
    authorizeRoles('ADMIN', 'MENTOR', 'STUDENT'),
    getMentors
);


router.put(
    '/profile',
    authMiddleware,
    authorizeRoles('MENTOR'),
    updateMentorProfile
);

export default router;