// src/routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database/database');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

router.post('/register', async (req, res) => {
    try {
        const { nome, email, senha } = req.body;
        
        if (!nome || !email || !senha) {
            return res.status(400).json({ erro: 'Campos obrigatórios' });
        }
        
        if (senha.length < 6) {
            return res.status(400).json({ erro: 'Senha mínimo 6 caracteres' });
        }
        
        const usuarioExiste = db.prepare(
            'SELECT id FROM usuarios WHERE email = ?'
        ).get(email);
        
        if (usuarioExiste) {
            return res.status(400).json({ erro: 'Email já cadastrado' });
        }
        
        const salt = await bcrypt.genSalt(10);
        const senhaHash = await bcrypt.hash(senha, salt);
        
        const result = db.prepare(`
            INSERT INTO usuarios (nome, email, senha)
            VALUES (?, ?, ?)
        `).run(nome, email, senhaHash);
        
        const userId = result.lastInsertRowid;
        
        const token = jwt.sign(
            { userId, email }, 
            JWT_SECRET,                
            { expiresIn: '24h' }     
        );
        
        res.status(201).json({
            mensagem: 'Usuário criado com sucesso',
            token,
            usuario: { id: userId, nome, email }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: 'Erro ao criar usuário' });
    }
});


router.post('/login', async (req, res) => {
    try {
        const { email, senha } = req.body;
        
        if (!email || !senha) {
            return res.status(400).json({ erro: 'Email e senha obrigatórios' });
        }
        
        const usuario = db.prepare(
            'SELECT * FROM usuarios WHERE email = ?'
        ).get(email);
        
        if (!usuario) {
            return res.status(401).json({ erro: 'Email ou senha incorretos' });
        }
        
        const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
        
        if (!senhaCorreta) {
            return res.status(401).json({ erro: 'Email ou senha incorretos' });
        }
        
        const token = jwt.sign(
            { userId: usuario.id, email: usuario.email },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        res.json({
            mensagem: 'Login realizado com sucesso',
            token,
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: 'Erro no login' });
    }
});

module.exports = router;