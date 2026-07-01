import prisma from '../config/database.js';
import bcrypt from 'bcrypt';
import { generateToken } from '../utils/jwt.js';


export async function loginService(email, password){
    //buscar usuario pelo email
    const user = await prisma.user.findUnique({where:{email}});

    if(!user){
        throw new Error("Usuário não encontrado");
    }

    //compara senha informada com senha salva no banco
    const passwordValid = await bcrypt.compare(password, user.password);

    if(!passwordValid){
        throw new Error("Senha inválida");
    }

    //criar token jwt
    const token = generateToken({
        id:user.id, 
        role:user.role
    });

    return {
        message:"Login realizado com sucesso",
        user:{
            id:user.id,
            name:user.name,
            email:user.email,
            role:user.role
        },

        token
    };

}


export async function registerService(data){
    const {
        name,
        email,
        password,
        confirmPassword
    } = data;

    if(password !== confirmPassword){
        throw new Error("As senhas não conferem");
        
    }

    const userExist = await prisma.user.findUnique({
        where: {
            email
        }
    });

    if(userExist){
        throw new Error("Email ja cadastrado");
        
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
        data: {
            name,
            email,
            password: passwordHash
        },

        select: {
            id:true,
            name:true,
            email:true,
            role:true
        }
    });

    return user;
}