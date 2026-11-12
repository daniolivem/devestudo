import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import routes from './routes/index.js';
import { swaggerSpec } from './config/swagger.js';

const app = express();

const configuredOrigins = (process.env.CORS_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
const developmentOrigins = process.env.NODE_ENV === 'production'
    ? []
    : ['http://localhost:5173', 'http://127.0.0.1:5173'];
const allowedOrigins = new Set([...developmentOrigins, ...configuredOrigins]);

// Permite origens configuradas; chamadas sem Origin (ex.: health checks) não
// dependem de CORS. CORS não substitui autenticação nem autorização da API.
app.use(cors({
    origin(origin, callback) {
        callback(null, !origin || allowedOrigins.has(origin));
    },
}));
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    swaggerOptions: {
        persistAuthorization: true
    }
}));

// Rotas
app.use('/api', routes);

// Rota inexistente
app.use((req, res) => {
    return res.status(404).json({
        success: false,
        message: 'Rota não encontrada'
    });
});

// Tratamento de erro centralizado (4xx / 5xx)
app.use((err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }

    let statusCode = err.statusCode || err.status || 500;
    let message = err.message;

    if (err.type === 'entity.parse.failed') {
        statusCode = 400;
        message = 'JSON inválido no corpo da requisição';
    }

    // Erros conhecidos do Prisma são traduzidos para respostas 4xx.
    if (err.code === 'P2002') {
        statusCode = 409;
        message = 'Já existe um registro com este valor';
    } else if (err.code === 'P2025') {
        statusCode = 404;
        message = 'Registro não encontrado';
    } else if (err.code === 'P2003') {
        statusCode = 409;
        message = 'Este registro possui vínculos e não pode ser alterado';
    } else if (err.name === 'PrismaClientValidationError') {
        statusCode = 400;
        message = 'Dados inválidos para a operação';
    }

    if (statusCode >= 500) {
        console.error(err);
        message = 'Erro interno do servidor';
    }

    return res.status(statusCode).json({
        success: false,
        message
    });
});


export default app;
