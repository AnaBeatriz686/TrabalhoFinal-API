const express = require('express');
const router = express.Router();
const db = require('../database/database');
const autenticar = require('../middleware/auth');

router.get('/', (req, res) => {
    const categorias = db.prepare('SELECT * FROM categorias').all();
    res.json(categorias);
});

router.get('/:id', (req, res) => {
    const id = parseInt(req.params.id);
    
    const categoria = db.prepare(
        'SELECT * FROM categorias WHERE id = ?'
    ).get(id);
    
    if (!categoria) {
        return res.status(404).json({ erro: 'Categoria não encontrada' });
    }

    const jogos = db.prepare(
        'SELECT * FROM jogos WHERE categoria_id = ?'
    ).all(id);
    
    res.json({
        ...categoria,
        jogos: jogos
    });
});

module.exports = router;