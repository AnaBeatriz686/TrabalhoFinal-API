const express = require('express');
const router = express.Router();
const db = require('../database/database');
const autenticar = require('../middleware/auth');

router.get('/', (req, res) => {
    try {
        const { 
            categoria, preco_max, preco_min, 
            ordem, direcao,
            pagina = 1, 
            limite = 10
        } = req.query;
        
        let sql = `
            SELECT 
                p.id, p.nome, p.preco, p.estoque, p.created_at,
                c.id AS categoria_id, c.nome AS categoria_nome, c.descricao AS categoria_descricao
            FROM jogos p
            INNER JOIN categorias c ON p.categoria_id = c.id
            WHERE 1=1
        `;
        let countSql = `
            SELECT COUNT(*) as total 
            FROM jogos p
            INNER JOIN categorias c ON p.categoria_id = c.id
            WHERE 1=1
        `;
        const params = [];
        
        if (categoria) {
            sql += ' AND c.nome = ?';
            countSql += ' AND c.nome = ?';
            params.push(categoria);
        }
        if (preco_max) {
            sql += ' AND p.preco <= ?';
            countSql += ' AND p.preco <= ?';
            params.push(parseFloat(preco_max));
        }
        if (preco_min) {
            sql += ' AND p.preco >= ?';
            countSql += ' AND p.preco >= ?';
            params.push(parseFloat(preco_min));
        }
        
        const countStmt = db.prepare(countSql);
        const { total } = countStmt.get(...params);
        
        if (ordem) {
            const camposValidos = ['nome', 'preco', 'created_at'];
            if (camposValidos.includes(ordem)) {
                sql += ` ORDER BY p.${ordem}`;
                if (direcao === 'desc') {
                    sql += ' DESC';
                } else {
                    sql += ' ASC';
                }
            }
        } else {
            sql += ' ORDER BY p.nome ASC'; 
        }
        
        const limiteNum = parseInt(limite);
        const paginaNum = parseInt(pagina);
        const offset = (paginaNum - 1) * limiteNum;
        
        sql += ' LIMIT ? OFFSET ?';
        params.push(limiteNum, offset);
        
        const stmt = db.prepare(sql);
        const jogos = stmt.all(...params);
        
        const jogosFormatados = jogos.map(p => ({
            id: p.id,
            nome: p.nome,
            preco: p.preco,
            estoque: p.estoque,
            categoria: {
                id: p.categoria_id,
                nome: p.categoria_nome,
                descricao: p.categoria_descricao
            },
            created_at: p.created_at
        }));
        
        res.json({
            dados: jogosFormatados,
            paginacao: {
                pagina_atual: paginaNum,
                itens_por_pagina: limiteNum,
                total_itens: total,
                total_paginas: Math.ceil(total / limiteNum)
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: 'Erro na busca de jogos' });
    }
});

module.exports = router;