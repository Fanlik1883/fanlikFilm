// Класс для управления авторизацией и регистрацией (использует глобальные cookie и $)
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
        const login = document.getElementById('Avtorization_login').value;
        const password = document.getElementById('Avtorization_password').value;

        this.$.ajaxSetup({ timeout: 3000 });
        this.$.get('https://api.allfilmbook.ru/user/Authorization/mobile1.php', { login, password })
            .done((data) => {
                const dates = JSON.parse(data);
                if (dates.answer === 'Ok') {
                    this.cookie.setCookieMy("user_hash", dates.hash);
                    this.cookie.setCookieMy("user_login", login);
                    location.reload();
                } else {
                    alert(data);
                }
            });
    }
}

// Создаём экземпляр класса с глобальными объектами cookie и $
const user = new UserAuth(cookie, $);
if (!user.UserHash || !user.UserName) {	user.Avtorization_ShowHide();}