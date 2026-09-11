import bcrypt from 'bcrypt';
import { findUserByEmail, createUser } from '../repositories/auth.repository.js';
import { generateToken } from '../utils/jwt.js';

const REGISTER_ROLES = ['STUDENT', 'MENTOR'];


export async function loginService(email, password) {
    //buscar usuario pelo email
    const user = await findUserByEmail(email);

    if (!user) {
        throw new Error("E-mail ou senha inválidos.");
    }

    //compara senha informada com senha salva no banco
    const passwordValid = await bcrypt.compare(password, user.password);

    if (!passwordValid) {
        throw new Error("E-mail ou senha inválidos.");
    }

    //criar token jwt
    const token = generateToken({
        id: user.id, 
        role: user.role,
    });

    return {
        message: "Login realizado com sucesso",
        user:{
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        },

        token
    };

}


export async function registerService({
        name,
        email,
        password,
        confirmPassword,
        role = 'STUDENT'
}) {

    if (!name || !email || !password || !confirmPassword) {
        const error = new Error("Todos os campos são obrigatórios");
        error.statusCode = 400;
        throw error;
    }

    if (password !== confirmPassword) {
        const error = new Error("As senhas não conferem");
        error.statusCode = 400;
        throw error;    
    }

    if (password.length < 8) {
        const error = new Error("A senha deve ter no mínimo 8 caracteres");
        error.statusCode = 400;
        throw error;
    }

    const hasNumber = /\d/.test(password);

    if (!hasNumber) {
        const error = new Error("A senha deve conter pelo menos um número");
        error.statusCode = 400;
        throw error;
    }

    const hasSpace = /\s/.test(password);

    if (hasSpace) {
        const error = new Error("A senha não deve conter espaços");
        error.statusCode = 400;
        throw error;
    }

    if (!REGISTER_ROLES.includes(role)) {
        const error = new Error("Tipo de usuário inválido");
        error.statusCode = 400;
        throw error;
    }

    const userExist = await findUserByEmail(email);

    if (userExist) {
        const error = new Error("E-mail já cadastrado");
        error.statusCode = 409;
        throw error;       
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await createUser({
            name,
            email,
            password: passwordHash,
            role
    });

    return user;
}