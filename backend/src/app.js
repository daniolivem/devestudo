import express from 'express';
import cors from 'cors';
import routes from './routes/index.js';

const app = express();

// Middlewares globais
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

// Rotas
app.use('/api', routes);

// Tratamento de erro
app.use((err, req, res, next) => {
    console.error(err);

    const statusCode = err.statusCode || 500;
    const message = statusCode === 500
        ? "Erro interno do servidor"
        : err.message;

    return res.status(statusCode).json({
        message
    });
});


export default app;