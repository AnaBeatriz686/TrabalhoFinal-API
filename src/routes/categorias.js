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

router.post('/', autenticar, (req, res) => {
    const { nome, descricao } = req.body;
   
    if (!nome) {
        return res.status(400).json({ erro: 'Nome obrigatório' });
    }
   
    try {
        const result = db.prepare(
            'INSERT INTO categorias (nome, descricao) VALUES (?, ?)'
        ).run(nome, descricao);
       
        const categoria = db.prepare(
            'SELECT * FROM categorias WHERE id = ?'
        ).get(result.lastInsertRowid);
       
        res.status(201).json(categoria);
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao criar categoria' });
    }
});

module.exports = router;