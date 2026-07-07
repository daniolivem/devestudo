import bcrypt from 'bcrypt';
import { findUserByEmail, createUser } from '../repositories/auth.repository.js';
import { generateToken } from '../utils/jwt.js';


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
}) {

    if (password !== confirmPassword) {
        throw new Error("As senhas não conferem");
        
    }

    const userExist = await findUserByEmail(email);

    if (userExist) {
        throw new Error("E-mail ja cadastrado");
        
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await createUser({
            name,
            email,
            password: passwordHash,
    });

    return user;
}