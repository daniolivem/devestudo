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

    return res.status(500).json({
      message: "Erro interno do servidor",
      error: err.message
    });
});


export default app;