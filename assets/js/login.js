document.addEventListener('DOMContentLoaded', () => {
  const { api, me } = PH;
  const msg = document.getElementById('auth-msg');
  const params = new URLSearchParams(location.search);
  const next = params.get('next') && /^[\w\-.]+\.html(\?[\w=&%\-]*)?$/.test(params.get('next')) ? params.get('next') : 'account.html';
  const show = (text, ok) => { msg.hidden = !text; msg.textContent = text || ''; msg.style.background = ok ? 'var(--lime)' : '#FDECEC'; msg.style.color = ok ? 'var(--ink)' : '#8A1F1F'; };
  function mode(m) {
    document.querySelectorAll('form[data-mode]').forEach((f) => { f.hidden = f.dataset.mode !== m; });
    document.querySelectorAll('#auth-tabs [data-mode]').forEach((b) => { const on = b.dataset.mode === m; b.setAttribute('aria-selected', on); b.style.background = on ? '#fff' : 'transparent'; });
    document.getElementById('auth-tabs').hidden = m === 'reset' || m === 'forgot';
    show('');
  }
  document.querySelectorAll('#auth-tabs [data-mode]').forEach((b) => b.addEventListener('click', () => mode(b.dataset.mode)));
  document.querySelectorAll('[data-go]').forEach((b) => b.addEventListener('click', () => mode(b.dataset.go)));
  const resetToken = params.get('reset');
  mode(resetToken ? 'reset' : params.get('mode') === 'signup' ? 'signup' : 'signin');
  me().then((u) => { if (u && !resetToken) location.href = next; });

  function handle(id, fn) {
    const f = document.getElementById(id);
    f.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!f.checkValidity()) { f.reportValidity(); return; }
      const btn = f.querySelector('button[type=submit]'); const label = btn.textContent;
      btn.disabled = true; btn.textContent = 'Please wait…'; show('');
      try { await fn(Object.fromEntries(new FormData(f).entries())); }
      catch (err) { show(err.message); }
      finally { btn.disabled = false; btn.textContent = label; }
    });
  }
  handle('f-signin', async (d) => { await api('/api/auth/login', { method: 'POST', body: d }); location.href = next; });
  handle('f-signup', async (d) => { await api('/api/auth/signup', { method: 'POST', body: d }); location.href = next; });
  handle('f-forgot', async (d) => { await api('/api/auth/forgot', { method: 'POST', body: d }); show('If an account exists for that email, a reset link is on its way. Check your inbox.', true); });
  handle('f-reset', async (d) => { await api('/api/auth/reset', { method: 'POST', body: { token: resetToken, password: d.password } }); location.href = 'account.html'; });
});
