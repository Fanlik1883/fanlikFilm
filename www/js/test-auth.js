(function(){
  const out = document.getElementById('out');
  function log(obj){
    try { out.textContent = (typeof obj === 'string' ? obj : JSON.stringify(obj, null, 2)); }
    catch(_) { out.textContent = String(obj); }
  }

  function getCookies(){
    try {
      const login = cookie.getCookie('user_login');
      const hash = cookie.getCookie('user_hash');
      return { login, hash };
    } catch(e){ return { error: e.message }; }
  }

  async function getFile(){
    try {
      if (!window.FileStorageInstance) return { error: 'FileStorageInstance not ready' };
      const res = await FileStorageInstance.readFile('user.json');
      return { raw: res.text, parsed: JSON.parse(res.text||'{}'), meta: { size: res.size, path: res.fullPath } };
    } catch(e){ return { error: e.message }; }
  }

  async function save(){
    try {
      const login = document.getElementById('login').value;
      const hash = document.getElementById('hash').value;
      if (!login || !hash) { log('login/hash required'); return; }
      // cookies
      cookie.setCookieMy('user_login', login);
      cookie.setCookieMy('user_hash', hash);
      // file
      const payload = { login, hash, version: 1, updated_at: new Date().toISOString() };
      await FileStorageInstance.writeFile('user.json', JSON.stringify(payload), false);
      // cordova http integration
      try { await user.applyToHttpPlugin && user.applyToHttpPlugin('https://api.allfilmbook.ru'); } catch(_) {}
      log({ saved: true, payload });
    } catch(e){ log(e.message); }
  }

  async function clearFile(){
    try { await FileStorageInstance.deleteFile('user.json'); log('file deleted'); }
    catch(e){ log('delete error: '+ e.message); }
  }

  function clearCookies(){
    try { cookie.setCookieMy('user_login',''); cookie.setCookieMy('user_hash',''); log('cookies cleared'); }
    catch(e){ log('cookie error: '+ e.message); }
  }

  async function resync(){
    try { const ok = await (user.syncCredentialsFromFile && user.syncCredentialsFromFile('user.json')); log({ resynced: !!ok, cookies: getCookies() }); }
    catch(e){ log(e.message); }
  }

  document.getElementById('viewCookies').addEventListener('click', ()=> log(getCookies()));
  document.getElementById('viewFile').addEventListener('click', async ()=> log(await getFile()));
  document.getElementById('save').addEventListener('click', save);
  document.getElementById('clearFile').addEventListener('click', clearFile);
  document.getElementById('clearCookies').addEventListener('click', clearCookies);
  document.getElementById('resync').addEventListener('click', resync);
})();

