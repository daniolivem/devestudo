import { loginService, registerService } from '../services/auth.service.js';

export async function login(req, res) {
    try{
        const { email, password } = req.body;
        console.log("Teste de verificação do email", email)
        console.log(Object.keys(req.body));
        const result = await loginService( email, password);

        return res.status(200).json(result);
    }catch(error){
        return res.status(400).json({message:error.message})
    }
}


export async function register(req, res) {
    try{
        const {
            name,
            email,
            password,
            confirmPassword
        } = req.body;

        const user = await registerService({
            name,
            email,
            password,
            confirmPassword
        });

        return res.status(201).json({message:"Usuário criado com sucesso", user});

    }catch(error){
        return res.status(400).json({message:error.message});
    }
}