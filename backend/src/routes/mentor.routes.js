import { Router } from 'express';
import { authMiddleware} from '../middlewares/auth.middleware.js';
import {authorizeRoles } from '../middlewares/role.middleware.js';
import { 
    getMentors, 
    updateMentorProfile 
} from '../controllers/mentor.controller.js';


const router = Router();

/**
 * @swagger
 * /api/mentors:
 *   get:
 *     summary: Lista os mentores
 *     tags: [Mentores]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: technology
 *         required: false
 *         schema:
 *           type: string
 *           example: JavaScript
 *     responses:
 *       200:
 *         description: Lista de mentores
 */
router.get(
    '/', 
    authMiddleware, 
    authorizeRoles('ADMIN', 'MENTOR', 'STUDENT'),
    getMentors
);


/**
 * @swagger
 * /api/mentors/profile:
 *   put:
 *     summary: Atualiza o perfil do mentor autenticado
 *     tags: [Mentores]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MentorProfile'
 *     responses:
 *       200:
 *         description: Perfil atualizado
 */
router.put(
    '/profile',
    authMiddleware,
    authorizeRoles('MENTOR'),
    updateMentorProfile
);

export default router;