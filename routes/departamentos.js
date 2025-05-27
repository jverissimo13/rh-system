const express = require('express');
const router = express.Router();
const db = require('../db/database');

// GET - Listar todos os departamentos
router.get('/', (req, res) => {
  db.all('SELECT * FROM departamentos', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// GET - Obter um departamento por ID
router.get('/:id', (req, res) => {
  const id = req.params.id;
  db.get('SELECT * FROM departamentos WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(row);
  });
});

// POST - Criar novo departamento
router.post('/', (req, res) => {
  const { nome } = req.body;
  db.run('INSERT INTO departamentos (nome) VALUES (?)', [nome], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, nome });
  });
});

// PUT - Atualizar um departamento
router.put('/:id', (req, res) => {
  const { nome } = req.body;
  const id = req.params.id;
  db.run('UPDATE departamentos SET nome = ? WHERE id = ?', [nome, id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id, nome });
  });
});

router.delete('/:id', (req, res) => {
  const id = req.params.id;
  const query = 'DELETE FROM departamentos WHERE id = ?';

  db.run(query, [id], function (err) {
    if (err) {
      if (err.message.includes('FOREIGN KEY')) {
        return res.status(400).json({ error: 'Não é possível excluir o departamento. Ele está sendo usado por funcionários.' });
      }
      return res.status(500).json({ error: err.message });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Departamento não encontrado' });
    }

    res.json({ message: 'Departamento excluído com sucesso' });
  });
});

module.exports = router;
