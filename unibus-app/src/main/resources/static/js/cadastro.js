    document.getElementById('form-cadastro').addEventListener('submit', function(e) {
    const ok = validarCadastro(document.getElementById('btn-cadastro'));
    if (!ok) e.preventDefault();
  });

  function togglePassword(id, btn) {
    const input = document.getElementById(id);
    const show = input.type === 'password';
    input.type = show ? 'text' : 'password';
    btn.innerHTML = show
      ? `<svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`
      : `<svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
  }

  function updateStrength() {
    const val = document.getElementById('cad-senha').value;
    const colors = ['#ef4444','#f97316','#eab308','#22c55e'];
    const labels = ['','Fraca','Razoável','Boa','Forte'];
    let score = 0;
    if (val.length >= 8) score++;
    if (/[A-Z]/.test(val)) score++;
    if (/[0-9]/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;
    ['s1','s2','s3','s4'].forEach((id, i) => {
      document.getElementById(id).style.background = i < score ? colors[score-1] : 'rgba(0,0,0,0.1)';
    });
    document.getElementById('strength-label').textContent = val.length > 0 ? labels[score] : '';
  }

  function setLoading(btn) {
    btn.disabled = true;
    btn.innerHTML = '<span class="loading-spinner"></span>';
  }

  function mostrarErro(input, errId) {
    input.classList.add('error');
    document.getElementById(errId).classList.add('show');
  }
  function limparErro(input, errId) {
    input.classList.remove('error');
    document.getElementById(errId).classList.remove('show');
  }

  function validarCadastro(btn) {
    const nome  = document.getElementById('cad-nome');
    const email = document.getElementById('cad-email');
    const senha = document.getElementById('cad-senha');
    let ok = true;
    if (!nome.value.trim()) { mostrarErro(nome,'cad-nome-err'); ok=false; } else limparErro(nome,'cad-nome-err');
    if (!email.value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) { mostrarErro(email,'cad-email-err'); ok=false; } else limparErro(email,'cad-email-err');
    if (!senha.value || senha.value.length < 8) { mostrarErro(senha,'cad-senha-err'); ok=false; } else limparErro(senha,'cad-senha-err');
    if (ok) setLoading(btn);
    return ok;
  }

  function handleGoogle() { alert('Login com Google será implementado em breve!'); }
