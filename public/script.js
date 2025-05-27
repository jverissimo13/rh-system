// Protege a página: redireciona se não estiver logado
if (!localStorage.getItem('usuarioLogado')) {
  window.location.href = '/login.html';
}

document.addEventListener('DOMContentLoaded', () => {
  const tbody = document.getElementById('funcionarios-table-body');
  const form = document.getElementById('form-funcionario');
  const nomeInput = document.getElementById('nome');
  const emailInput = document.getElementById('email');
  const cargoSelect = document.getElementById('cargo_id');
  const departamentoSelect = document.getElementById('departamento_id');
  const filtroCargo = document.getElementById('filtro-cargo');
  const filtroDepartamento = document.getElementById('filtro-departamento');
  let editId = null;

  function carregarFuncionarios() {
    const cargoId = filtroCargo.value;
    const departamentoId = filtroDepartamento.value;

    fetch('/funcionarios')
      .then(res => res.json())
      .then(funcionarios => {
        const filtrados = funcionarios.filter(f => {
          const cargoOK = !cargoId || f.cargo_id == cargoId;
          const depOK = !departamentoId || f.departamento_id == departamentoId;
          return cargoOK && depOK;
        });

        tbody.innerHTML = '';
        filtrados.forEach(f => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td>${f.nome}</td>
            <td>${f.email}</td>
            <td>${f.cargo}</td>
            <td>${f.departamento}</td>
            <td>
              <button class="btn-edit" data-id="${f.id}">Editar</button>
              <button class="btn-delete" data-id="${f.id}">Excluir</button>
            </td>
          `;
          tbody.appendChild(tr);
        });
      });
  }

  function carregarCargos() {
    fetch('/cargos')
      .then(res => res.json())
      .then(cargos => {
        cargoSelect.innerHTML = '<option value="">Selecione um Cargo</option>';
        filtroCargo.innerHTML = '<option value="">Todos os Cargos</option>';
        cargos.forEach(cargo => {
          const option1 = document.createElement('option');
          option1.value = cargo.id;
          option1.textContent = cargo.nome;
          cargoSelect.appendChild(option1);
          filtroCargo.appendChild(option1.cloneNode(true));
        });
      });
  }

  function carregarDepartamentos() {
    fetch('/departamentos')
      .then(res => res.json())
      .then(departamentos => {
        departamentoSelect.innerHTML = '<option value="">Selecione um Departamento</option>';
        filtroDepartamento.innerHTML = '<option value="">Todos os Departamentos</option>';
        departamentos.forEach(dep => {
          const option1 = document.createElement('option');
          option1.value = dep.id;
          option1.textContent = dep.nome;
          departamentoSelect.appendChild(option1);
          filtroDepartamento.appendChild(option1.cloneNode(true));
        });
      });
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    const payload = {
      nome: nomeInput.value,
      email: emailInput.value,
      cargo_id: parseInt(cargoSelect.value),
      departamento_id: parseInt(departamentoSelect.value)
    };

    const url = editId ? `/funcionarios/${editId}` : '/funcionarios';
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
        carregarFuncionarios();
      });
  });

  tbody.addEventListener('click', e => {
    const id = e.target.dataset.id;

    if (e.target.classList.contains('btn-delete')) {
      fetch(`/funcionarios/${id}`, { method: 'DELETE' })
        .then(res => res.json())
        .then(() => carregarFuncionarios());
    }

    if (e.target.classList.contains('btn-edit')) {
      fetch(`/funcionarios/${id}`)
        .then(res => res.json())
        .then(f => {
          nomeInput.value = f.nome;
          emailInput.value = f.email;
          cargoSelect.value = f.cargo_id.toString();
          departamentoSelect.value = f.departamento_id.toString();
          editId = id;
          form.querySelector('button[type="submit"]').textContent = 'Salvar';
        });
    }
  });

  filtroCargo.addEventListener('change', carregarFuncionarios);
  filtroDepartamento.addEventListener('change', carregarFuncionarios);

  carregarFuncionarios();
  carregarCargos();
  carregarDepartamentos();
});
