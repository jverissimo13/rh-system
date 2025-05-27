if (!localStorage.getItem('usuarioLogado')) {
  window.location.href = '/login.html';
}

document.addEventListener('DOMContentLoaded', () => {
  const tbody = document.getElementById('cargos-table-body');
  const form = document.getElementById('form-cargo');
  const nomeInput = document.getElementById('nome');
  let editId = null;

  function carregarCargos() {
    fetch('/cargos')
      .then(res => res.json())
      .then(cargos => {
        tbody.innerHTML = '';
        cargos.forEach(cargo => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td>${cargo.nome}</td>
            <td>
              <button class="btn-edit" data-id="${cargo.id}">Editar</button>
              <button class="btn-delete" data-id="${cargo.id}">Excluir</button>
            </td>
          `;
          tbody.appendChild(tr);
        });
      });
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    const payload = { nome: nomeInput.value };
    const url = editId ? `/cargos/${editId}` : '/cargos';
    const method = editId ? 'PUT' : 'POST';

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(() => {
        form.reset();
        editId = null;
        form.querySelector('button[type="submit"]').textContent = 'Cadastrar';
        carregarCargos();
      });
  });

  tbody.addEventListener('click', e => {
    const id = e.target.dataset.id;

    if (e.target.classList.contains('btn-delete')) {
  fetch(`/cargos/${id}`, { method: 'DELETE' })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        alert(data.error);
      } else {
        carregarCargos();
      }
    })
    .catch(() => alert('Erro ao tentar excluir o cargo.'));
}

    if (e.target.classList.contains('btn-edit')) {
      fetch(`/cargos/${id}`)
        .then(res => res.json())
        .then(cargo => {
          nomeInput.value = cargo.nome;
          editId = id;
          form.querySelector('button[type="submit"]').textContent = 'Salvar';
        });
    }
  });

  carregarCargos();
});
