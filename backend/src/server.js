import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import routes from './routes/index.js'

dotenv.config()


const app = express();
// Porta
const PORT = process.env.PORT || 3000;


// Middlewares
app.use(cors());
app.use(express.json());

// Rotas
app.use('/api', routes);

// Tratamento de erro
app.use((err, req, res, next) =>{
    console.error(err)

    res.status(500).json({
      error: "Erro interno do servidor"
    })
})

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});


