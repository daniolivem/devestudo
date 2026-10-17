import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import routes from './routes/index.js';
import { swaggerSpec } from './config/swagger.js';

const app = express();

// Middlewares globais
app.use(cors());
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
        message: 'Rota não encontrada'
    });
});

// Tratamento de erro
app.use((err, req, res, next) => {
    console.error(err);

    if (res.headersSent) {
        return next(err);
    }

    const statusCode = err.statusCode || err.status || (
        err.type === 'entity.parse.failed' ? 400 : 500
    );
    const message = statusCode >= 500
        ? 'Erro interno do servidor'
        : err.message;

    return res.status(statusCode).json({
        message
    });
});


export default app;