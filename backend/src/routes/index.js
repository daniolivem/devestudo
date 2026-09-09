import { Router } from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import profileRoutes from './profile.routes.js';

const router = Router();

router.get('/', (req, res) => {
    return res.status(200).json({ message: "API funcionando"});
})

//Rotas de usuários
router.use('/users', userRoutes);

//Rotas de autenticação
router.use('/auth', authRoutes);

//Rotas de perfil
router.use('/profile', profileRoutes);

export default router;