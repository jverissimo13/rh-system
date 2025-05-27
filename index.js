const express = require('express');
const app = express();
require('dotenv').config();

const db = require('./db/database');

app.use(express.json());
app.use(express.static('public'));

// Rotas principais
app.use('/departamentos', require('./routes/departamentos'));
app.use('/cargos', require('./routes/cargos'));
app.use('/funcionarios', require('./routes/funcionarios'));

// Login de usuário
app.post('/login', (req, res) => {
  const { email, senha } = req.body;
  const sql = 'SELECT * FROM usuarios WHERE email = ? AND senha = ?';
  db.get(sql, [email, senha], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });

    if (row) {
      res.json({ success: true, usuario: { id: row.id, nome: row.nome, email: row.email } });
    } else {
      res.json({ success: false });
    }
  });
});

// Cadastro de novo usuário (restrito ao admin)
app.post('/usuarios', (req, res) => {
  const { nome, email, senha } = req.body;
  const remetente = req.headers['x-user-email'];

  if (remetente !== 'admin@empresa.com') {
    return res.status(403).json({ success: false, error: 'Acesso não autorizado.' });
  }

  if (!nome || !email || !senha) {
    return res.status(400).json({ success: false, error: 'Todos os campos são obrigatórios.' });
  }

  const checkSql = 'SELECT id FROM usuarios WHERE email = ?';
  db.get(checkSql, [email], (err, row) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    if (row) return res.status(400).json({ success: false, error: 'Email já cadastrado.' });

    const insertSql = 'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)';
    db.run(insertSql, [nome, email, senha], function (err) {
      if (err) return res.status(500).json({ success: false, error: err.message });
      res.json({ success: true, id: this.lastID });
    });
  });
});
// Listar todos os usuários (somente admin)
app.get('/usuarios', (req, res) => {
  if (req.headers['x-user-email'] !== 'admin@empresa.com') {
    return res.status(403).json({ error: 'Acesso não autorizado.' });
  }

  db.all('SELECT id, nome, email FROM usuarios', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Atualizar usuário (somente admin)
app.put('/usuarios/:id', (req, res) => {
  if (req.headers['x-user-email'] !== 'admin@empresa.com') {
    return res.status(403).json({ error: 'Acesso não autorizado.' });
  }

  const { nome, email, senha } = req.body;
  const id = req.params.id;

  const fields = ['nome = ?', 'email = ?'];
  const values = [nome, email];

  if (senha) {
    fields.push('senha = ?');
    values.push(senha);
  }

  values.push(id);

  const query = `UPDATE usuarios SET ${fields.join(', ')} WHERE id = ?`;

  db.run(query, values, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Usuário atualizado com sucesso' });
  });
});

// Excluir usuário (somente admin, não pode excluir a si mesmo)
app.delete('/usuarios/:id', (req, res) => {
  const userEmail = req.headers['x-user-email'];
  if (userEmail !== 'admin@empresa.com') {
    return res.status(403).json({ error: 'Acesso não autorizado.' });
  }

  const id = req.params.id;

  // Impede exclusão do admin
  db.get('SELECT email FROM usuarios WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (row?.email === 'admin@empresa.com') {
      return res.status(400).json({ error: 'Não é permitido excluir o administrador.' });
    }

    db.run('DELETE FROM usuarios WHERE id = ?', [id], function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Usuário excluído com sucesso' });
    });
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
