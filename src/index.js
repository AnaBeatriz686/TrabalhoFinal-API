const express = require('express');
require('dotenv').config();

const app = express();

app.use(express.json());

const authRoutes = require('./routes/auth');
const categoriasRoutes = require('./routes/categorias');
const jogosRoutes = require('./routes/jogos');

app.use('/auth', authRoutes);
app.use('/api/categorias', categoriasRoutes);
app.use('/api/jogos', jogosRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});