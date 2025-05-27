if (!localStorage.getItem('usuarioLogado')) {
  window.location.href = '/login.html';
}

document.addEventListener('DOMContentLoaded', () => {
  const tbody = document.getElementById('departamentos-table-body');
  const form = document.getElementById('form-departamento');
  const nomeInput = document.getElementById('nome');
  let editId = null;

  function carregarDepartamentos() {
    fetch('/departamentos')
      .then(res => res.json())
      .then(departamentos => {
        tbody.innerHTML = '';
        departamentos.forEach(dep => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td>${dep.nome}</td>
            <td>
              <button class="btn-edit" data-id="${dep.id}">Editar</button>
              <button class="btn-delete" data-id="${dep.id}">Excluir</button>
            </td>
          `;
          tbody.appendChild(tr);
        });
      });
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    const payload = { nome: nomeInput.value };
    const url = editId ? `/departamentos/${editId}` : '/departamentos';
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
        carregarDepartamentos();
      });
  });

  tbody.addEventListener('click', e => {
    const id = e.target.dataset.id;

    if (e.target.classList.contains('btn-delete')) {
  fetch(`/departamentos/${id}`, { method: 'DELETE' })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        alert(data.error);
      } else {
        carregarDepartamentos();
      }
    })
    .catch(() => alert('Erro ao tentar excluir o departamento.'));
}

    if (e.target.classList.contains('btn-edit')) {
      fetch(`/departamentos/${id}`)
        .then(res => res.json())
        .then(dep => {
          nomeInput.value = dep.nome;
          editId = id;
          form.querySelector('button[type="submit"]').textContent = 'Salvar';
        });
    }
  });

  carregarDepartamentos();
});
