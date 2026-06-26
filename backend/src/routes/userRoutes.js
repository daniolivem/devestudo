import express from 'express'
import prisma from '../config/database.js'

const router = express.Router()

router.get('/', async (req, res) => {
    try {
        const users = await prisma.user.findMany({
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
            updatedAt: true
        }
    })
       
   res.json(users)

    }catch(error){
        console.log(error)

        res.status(500).json({
            error: "Erro ao buscar usuários"
        })
    }
 
})

export default router