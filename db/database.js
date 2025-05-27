const sqlite3 = require('sqlite3').verbose();

// ✅ única instância da conexão correta
const db = new sqlite3.Database('./db/rh.db', (err) => {
  if (err) console.error(err.message);
  console.log('Conectado ao banco de dados.');
});

// Habilitar foreign keys
db.run("PRAGMA foreign_keys = ON");

// Criar tabelas
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS departamentos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    descricao TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS cargos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    descricao TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS funcionarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT NOT NULL,
    cargo_id INTEGER NOT NULL,
    departamento_id INTEGER NOT NULL,
    FOREIGN KEY (cargo_id) REFERENCES cargos(id) ON DELETE RESTRICT,
    FOREIGN KEY (departamento_id) REFERENCES departamentos(id) ON DELETE RESTRICT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    senha TEXT NOT NULL
  )`);

  // Inserir usuário admin padrão
  db.get("SELECT COUNT(*) AS total FROM usuarios", (err, row) => {
    if (row.total === 0) {
      db.run(`INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)`,
        ['Admin', 'admin@empresa.com', '123456']);
    }
  });
});

module.exports = db;
