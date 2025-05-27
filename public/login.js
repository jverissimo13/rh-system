document.getElementById('login-form').addEventListener('submit', e => {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const senha = document.getElementById('senha').value;

  fetch('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, senha })
  })
    .then(res => res.json())
        .then(data => {
      if (data.success) {
        localStorage.setItem('usuarioLogado', JSON.stringify(data.usuario));
        window.location.href = '/';
      } else {
        document.getElementById('erro').textContent = 'Login inválido.';
      }
    });
});
