const Database = require('better-sqlite3');
const db = new Database('jogos.db');

db.exec('PRAGMA foreign_keys = ON');

const createCategorias = `
    CREATE TABLE IF NOT EXISTS categorias (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome VARCHAR(50) NOT NULL UNIQUE,
        descricao TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
`;
db.exec(createCategorias);

const createJogos = `
    CREATE TABLE IF NOT EXISTS jogos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome VARCHAR(100) NOT NULL,
        preco DECIMAL(10,2) NOT NULL,
        categoria_id INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        FOREIGN KEY (categoria_id) REFERENCES categorias(id)
            ON DELETE RESTRICT
            ON UPDATE CASCADE
    )
`;
db.exec(createJogos);

const createUsuarios = `
    CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        senha VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
`;
db.exec(createUsuarios);

console.log('Banco de dados e tabelas criadas com sucesso!');

const seedDatabase = () => {
    const row = db.prepare('SELECT COUNT(*) as total FROM jogos').get();
    
    if (row.total === 0) {

        const insertCat = db.prepare('INSERT OR IGNORE INTO categorias (id, nome) VALUES (?, ?)');
        insertCat.run(1, 'Ação');
        insertCat.run(2, 'RPG');
        insertCat.run(3, 'Estratégia');
        insertCat.run(4, 'Aventura');

        const listaJogos = [
            ['Elden Ring', 249.90, 2], ['God of War Ragnarok', 299.00, 1],
            ['Cyberpunk 2077', 199.00, 2], ['The Witcher 3', 79.90, 2],
            ['Red Dead Redemption 2', 120.00, 4], ['Spider-Man 2', 349.00, 1],
            ['Hollow Knight', 45.00, 4], ['Minecraft', 99.00, 4],
            ['Age of Empires IV', 150.00, 3], ['Starfield', 299.00, 2],
            ['Final Fantasy XVI', 349.00, 2], ['Resident Evil 4 Remake', 249.00, 1],
            ['Street Fighter 6', 279.00, 1], ['Diablo IV', 349.00, 2],
            ['Baldur\'s Gate 3', 199.00, 2], ['Civilization VI', 129.00, 3],
            ['Stardew Valley', 25.00, 4], ['Sekiro: Shadows Die Twice', 199.00, 1],
            ['The Last of Us Part I', 349.00, 4], ['Horizon Forbidden West', 199.00, 4]
        ];

        const insertJogo = db.prepare(`
            INSERT INTO jogos (nome, preco, categoria_id) 
            VALUES (?, ?, ?)
        `);

        listaJogos.forEach(jogo => insertJogo.run(...jogo));

    }
};

seedDatabase();

module.exports = db;