import express from 'express'
import userRoutes from './userRoutes.js'
import authRoutes from './auth.routes.js'

const router = express.Router();

router.get('/', (req, res) => {
    res.json({ message: "API funcionado"});
})

//usuarios
router.use('/users', userRoutes);

//autenticação
router.use("/auth",authRoutes);

export default router;