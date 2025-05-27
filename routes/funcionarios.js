const express = require('express');
const router = express.Router();
const db = require('../db/database');

// GET - Listar todos os funcionários
router.get('/', (req, res) => {
  const query = `
    SELECT f.id,
           f.nome,
           f.email,
           f.cargo_id,
           f.departamento_id,
           c.nome AS cargo,
           d.nome AS departamento
    FROM funcionarios f
    LEFT JOIN cargos c ON f.cargo_id = c.id
    LEFT JOIN departamentos d ON f.departamento_id = d.id
  `;
  db.all(query, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// GET - Buscar um funcionário por ID (com IDs de cargo e departamento)
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const query = `
    SELECT f.id, f.nome, f.email, f.cargo_id, f.departamento_id,
           c.nome AS cargo, d.nome AS departamento
    FROM funcionarios f
    LEFT JOIN cargos c ON f.cargo_id = c.id
    LEFT JOIN departamentos d ON f.departamento_id = d.id
    WHERE f.id = ?
  `;
  db.get(query, [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Funcionário não encontrado' });
    res.json(row);
  });
});

// POST - Criar novo funcionário usando IDs de cargo e departamento
router.post('/', (req, res) => {
  const { nome, email, cargo_id, departamento_id } = req.body;

  if (!nome || !email || !cargo_id || !departamento_id) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
  }

  const query = `
    INSERT INTO funcionarios (nome, email, cargo_id, departamento_id)
    VALUES (?, ?, ?, ?)
  `;

  db.run(query, [nome, email, cargo_id, departamento_id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: this.lastID });
  });
});

// Atualizar funcionário
// PUT - Atualizar funcionário usando IDs
router.put('/:id', (req, res) => {
  const { nome, email, cargo_id, departamento_id } = req.body;
  const id = req.params.id;

  if (!nome || !email || !cargo_id || !departamento_id) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
  }

  const query = `
    UPDATE funcionarios
    SET nome = ?,
        email = ?,
        cargo_id = ?,
        departamento_id = ?
    WHERE id = ?
  `;

  db.run(query, [nome, email, cargo_id, departamento_id, id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Funcionário não encontrado' });
    res.json({ message: 'Funcionário atualizado com sucesso' });
  });
});

// Deletar funcionário
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const query = `DELETE FROM funcionarios WHERE id = ?`;
  db.run(query, [id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Funcionário não encontrado' });
    res.json({ message: 'Funcionário excluído com sucesso' });
  });
});

module.exports = router;
