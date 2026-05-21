  function switchView(v) {
    document.querySelectorAll('.view').forEach(el => el.classList.remove('active'));
    document.getElementById('view-' + v).classList.add('active');
  }

  function togglePassword(id, btn) {
    const input = document.getElementById(id);
    const show = input.type === 'password';
    input.type = show ? 'text' : 'password';
    btn.innerHTML = show
      ? `<svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`
      : `<svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
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

  function validarLogin(btn) {
    const email = document.getElementById('login-email');
    const senha = document.getElementById('login-senha');
    let ok = true;
    if (!email.value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) { mostrarErro(email,'login-email-err'); ok=false; } else limparErro(email,'login-email-err');
    if (!senha.value) { mostrarErro(senha,'login-senha-err'); ok=false; } else limparErro(senha,'login-senha-err');
    if (ok) setLoading(btn);
    return ok;
  }

  function validarReset(btn) {
    const email = document.getElementById('reset-email');
    if (!email.value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      mostrarErro(email,'reset-email-err'); return false;
    }
    limparErro(email,'reset-email-err');
    setLoading(btn);
    return true;
  }

  function handleGoogle() { alert('Login com Google será implementado em breve!'); }
