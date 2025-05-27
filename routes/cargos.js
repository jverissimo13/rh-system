const express = require('express');
const router = express.Router();
const db = require('../db/database');

// Cadastrar cargo com validação
router.post('/', (req, res) => {
  const { nome } = req.body;

  if (!nome || nome.trim() === '') {
    return res.status(400).json({ error: 'O nome do cargo é obrigatório' });
  }

  const query = `INSERT INTO cargos (nome) VALUES (?)`;
  db.run(query, [nome.trim()], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ id: this.lastID });
  });
});

// Listar todos os cargos
router.get('/', (req, res) => {
  const query = 'SELECT * FROM cargos';
  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Atualizar cargo
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { nome } = req.body;

  if (!nome || nome.trim() === '') {
    return res.status(400).json({ error: 'O nome do cargo é obrigatório' });
  }

  const query = `UPDATE cargos SET nome = ? WHERE id = ?`;
  db.run(query, [nome.trim(), id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Cargo não encontrado' });
    }
    res.json({ message: 'Cargo atualizado com sucesso' });
  });
});

router.delete('/:id', (req, res) => {
  const id = req.params.id;
  const query = 'DELETE FROM cargos WHERE id = ?';

  db.run(query, [id], function (err) {
    if (err) {
      if (err.message.includes('FOREIGN KEY')) {
        return res.status(400).json({ error: 'Não é possível excluir o cargo. Ele está sendo usado por funcionários.' });
      }
      return res.status(500).json({ error: err.message });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Cargo não encontrado' });
    }

    res.json({ message: 'Cargo excluído com sucesso' });
  });
});

// Buscar cargo por ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM cargos WHERE id = ?';
  db.get(query, [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Cargo não encontrado' });
    }
    res.json(row);
  });
});

module.exports = router;
