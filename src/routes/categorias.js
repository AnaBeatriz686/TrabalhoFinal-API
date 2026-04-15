const express = require('express');
const router = express.Router();
const db = require('../database');
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

router.put('/:id', autenticar, (req, res) => {
    const id = parseInt(req.params.id);
    const { nome, descricao } = req.body;

    if (!nome) {
        return res.status(400).json({ erro: 'O nome é obrigatório para atualizar' });
    }

    try {

        const result = db.prepare(
            'UPDATE categorias SET nome = ?, descricao = ? WHERE id = ?'
        ).run(nome, descricao, id);

        if (result.changes === 0) {
            return res.status(404).json({ erro: 'Categoria não encontrada' });
        }

        res.json({
            id,
            nome,
            descricao
        });
    } catch (error) {

        if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            return res.status(400).json({ erro: 'Já existe uma categoria com este nome' });
        }
        res.status(500).json({ erro: 'Erro ao atualizar categoria' });
    }
});

router.delete('/:id', autenticar, (req, res) => {
    const id = parseInt(req.params.id);
   
    const temJogos = db.prepare(
        'SELECT COUNT(*) as total FROM jogos WHERE categoria_id = ?'
    ).get(id);
   
    if (temJogos.total > 0) {
        return res.status(400).json({
            erro: `Não pode deletar. Categoria tem ${temJogos.total} jogos`
        });
    }
   
    db.prepare('DELETE FROM categorias WHERE id = ?').run(id);
    res.status(204).send();
});

module.exports = router;