// Класс для управления авторизацией и регистрацией (универсальный; использует глобальные cookie и $, но имеет фоллбек на fetch)
class UserAuth {
    /**
     * @param {Cookie} cookieHelper - экземпляр класса Cookie
     * @param {jQuery} $ - глобальный объект jQuery
     */
    constructor(cookieHelper, $) {
        this.cookie = cookieHelper;
        this.$ = $;

        // Инициализация данных пользователя из куки
        this.UserHash = this.cookie.getCookie("user_hash") || '';
        this.UserName = this.cookie.getCookie("user_login") || '';
    }

    /**
     * Показать/скрыть окно регистрации
     */
    AddUser_ShowHide() {
        const modal = document.getElementById('Registration_Head');
        if (modal.classList.contains("dm-overlay")) {
            modal.classList.remove("dm-overlay");
            modal.classList.add('dm-overlayV');
        } else {
            modal.classList.remove("dm-overlayV");
            modal.classList.add("dm-overlay");
        }
    }

    /**
     * Отправить запрос на регистрацию
     */
    RegistrationPost() {
        const login = document.getElementById('Registration_login').value;
        const password = document.getElementById('Registration_password').value;

        this.$.ajaxSetup({ timeout: 3000 });
        this.$.get('https://api.allfilmbook.ru/user/Registration/', { login, password })
            .done((data) => {
                if (data === "Ok") {
                    this.AddUser_ShowHide();
                    this.Avtorization_ShowHide();
                } else {
                    alert(data);
                }
            });
    }

    /**
     * Показать/скрыть окно авторизации
     */
    Avtorization_ShowHide() {
        const modal = document.getElementById('Avtorization_Head');
        if (modal.classList.contains("dm-overlay")) {
            modal.classList.remove("dm-overlay");
            modal.classList.add('dm-overlayV');
        } else {
            modal.classList.remove("dm-overlayV");
            modal.classList.add("dm-overlay");
        }
    }

    /**
     * Отправить запрос на авторизацию
     */
    AvtorizationPost() {
        const login = (document.getElementById('Avtorization_login')||{}).value;
        const password = (document.getElementById('Avtorization_password')||{}).value;

        const onSuccess = async (dates) => {
            try {
                if (dates.answer === 'Ok') {
                    // sync cookies
                    this.cookie.setCookieMy("user_hash", dates.hash);
                    this.cookie.setCookieMy("user_login", login);
                    // persist to file as source of truth
                    await this.saveCredentialsToFile(login, dates.hash);
                    // expose globals
                    window.UserName = login; window.UserHash = dates.hash;
                    // apply to cordova http if available
                    await this.applyToHttpPlugin('https://api.allfilmbook.ru');
                    // hide modal and reload
                    try { this.Avtorization_ShowHide(); } catch(_) {}
                    location.reload();
                } else {
                    alert(JSON.stringify(dates));
                }
            } catch (e) {
                console.error('Auth post-processing failed', e);
                alert('Ошибка сохранения авторизации: '+ e.message);
            }
        };

        // jQuery путь
        if (this.$ && this.$.get) {
            try { this.$.ajaxSetup({ timeout: 3000 }); } catch(_) {}
            this.$.get('https://api.allfilmbook.ru/user/Authorization/mobile1.php', { login, password })
                .done((data) => {
                    let dates; try { dates = JSON.parse(data); } catch { dates = { answer:'Err', raw:data }; }
                    onSuccess(dates);
                })
                .fail((err) => alert('Ошибка сети авторизации'));
            return;
        }

        // fetch фоллбек
        (async () => {
            try {
                const ctrl = new AbortController();
                const to = setTimeout(() => ctrl.abort(), 3000);
                const url = new URL('https://api.allfilmbook.ru/user/Authorization/mobile1.php');
                url.searchParams.set('login', login);
                url.searchParams.set('password', password);
                const res = await fetch(url.toString(), { signal: ctrl.signal });
                clearTimeout(to);
                const text = await res.text();
                let dates; try { dates = JSON.parse(text); } catch { dates = { answer:'Err', raw:text }; }
                onSuccess(dates);
            } catch (e) {
                alert('Ошибка сети авторизации');
            }
        })();
    }

    // ==================== Универсальные расширения ====================
    /**
     * Рендерит форму авторизации, если она отсутствует в DOM
     * @param {string} [containerId='Avtorization_Head']
     */
    renderForm(containerId = 'Avtorization_Head') {
        if (document.getElementById(containerId)) return; // уже есть в разметке страницы
        const wrap = document.createElement('div');
        wrap.id = containerId;
        wrap.className = 'dm-overlayV'; // скрыто по умолчанию
        wrap.innerHTML = "<div class=\"dm-table\"><div class=\"dm-cell\"><div class=\"dm-modal\">"+
            "<h3>Авторизация</h3>"+
            "Логин:<input id=\"Avtorization_login\" type=\"text\" size=\"40\" /><br />"+
            "Пароль:<input id=\"Avtorization_password\" type=\"password\" size=\"40\" /><br />"+
            "<br /><a href=\"#\" id=\"authLoginBtn\">Войти</a> "+
            "<a href=\"#\" id=\"authCloseBtn\">Закрыть</a>"+
            "</div></div></div>";
        document.body.appendChild(wrap);
        // Привязка действий
        const loginBtn = document.getElementById('authLoginBtn');
        const closeBtn = document.getElementById('authCloseBtn');
        if (loginBtn) loginBtn.addEventListener('click', (e)=>{ e.preventDefault(); this.AvtorizationPost(); });
        if (closeBtn) closeBtn.addEventListener('click', (e)=>{ e.preventDefault(); this.Avtorization_ShowHide(); });
    }

    /** Показывает форму при отсутствии авторизации */
    ensureAuthPrompt() {
        if (!this.isLoggedIn()) {
            try { this.renderForm(); } catch(_) {}
            this.Avtorization_ShowHide();
        }
    }

    /** Проверка авторизации по куки */
    isLoggedIn() {
        try {
            const name = this.cookie.getCookie('user_login');
            const hash = this.cookie.getCookie('user_hash');
            return !!(name && hash);
        } catch { return false; }
    }

    /** Синхронизировать учетные данные из файла user.json (источник истины) */
    async syncCredentialsFromFile(fileName = 'user.json') {
        try {
            if (!window.FileStorageInstance) return false;
            const res = await window.FileStorageInstance.readFile(fileName);
            const data = JSON.parse(res.text || '{}');
            if (data && data.login && data.hash) {
                this.cookie.setCookieMy('user_login', data.login);
                this.cookie.setCookieMy('user_hash', data.hash);
                window.UserName = data.login; window.UserHash = data.hash;
                return true;
            }
        } catch (e) {
            // файл может отсутствовать — это не ошибка
        }
        return false;
    }

    /** Сохранить учетные данные в файл user.json */
    async saveCredentialsToFile(login, hash, fileName = 'user.json') {
        if (!window.FileStorageInstance) return;
        const now = new Date().toISOString();
        const payload = { login, hash, version: 1, updated_at: now };
        await window.FileStorageInstance.writeFile(fileName, JSON.stringify(payload), false);
    }

    /** Применить куки к cordova-plugin-http, если доступен */
    async applyToHttpPlugin(url) {
        try {
            if (!window.cordova || !cordova.plugin || !cordova.plugin.http) return;
            const login = this.cookie.getCookie('user_login');
            const hash = this.cookie.getCookie('user_hash');
            if (hash) cordova.plugin.http.setCookie(url, `user_hash=${hash}; path=/`);
            if (login) cordova.plugin.http.setCookie(url, `user_login=${login}; path=/`);
        } catch(_) {}
    }
}

// Экземпляр создается в init-auth.js и сохраняется в window.user
