// Константа для отладки (установите false в production)
const DEBUG = true; 

// Универсальная функция ожидания готовности платформы (Cordova/Browser)
function onReady(callback){
  if (window.cordova) {
    if (DEBUG) console.log('onReady: ожидание deviceready (Cordova)');
    document.addEventListener('deviceready', callback, false);
  } else if (document.readyState === 'loading') {
    if (DEBUG) console.log('onReady: ожидание DOMContentLoaded');
    document.addEventListener('DOMContentLoaded', callback);
  } else {
    if (DEBUG) console.log('onReady: DOM уже загружен, выполняем немедленно');
    setTimeout(callback, 0);
  }
}

// Совместимость со старыми глобальными функциями (вызовы без префикса user.)
window.Avtorization_ShowHide = function(){ try { if (DEBUG) console.log('Вызов Avtorization_ShowHide'); window.user && window.user.Avtorization_ShowHide(); } catch(_){} };
window.AvtorizationPost = function(){ try { if (DEBUG) console.log('Вызов AvtorizationPost'); window.user && window.user.AvtorizationPost(); } catch(_){} };
window.RegistrationPost = function(){ try { if (DEBUG) console.log('Вызов RegistrationPost'); window.user && window.user.RegistrationPost(); } catch(_){} };
window.AddUser_ShowHide = function(){ try { if (DEBUG) console.log('Вызов AddUser_ShowHide'); window.user && window.user.AddUser_ShowHide(); } catch(_){} };

onReady(async function(){
  if (DEBUG) console.log('onReady: старт инициализации auth');
  try {
    // 1) Инициализация FileStorage в общей директории
    if (DEBUG) console.log('Инициализация FileStorage с base=auto, subDir=FanlikApps');
    window.FileStorageInstance = new FileStorage({ base: 'auto', subDir: 'FanlikApps' });
    if (DEBUG) console.log('FileStorageInstance создан');

    // 2) Создаем/переиспользуем менеджер авторизации
    if (DEBUG) console.log('Создание/переиспользование UserAuth');
    window.user = window.user || new UserAuth(cookie, window.$ || window.jQuery || null);
    if (DEBUG) console.log('UserAuth готов');

    // 3) Убедимся, что форма существует (создаст свою, если нет в верстке)
    if (DEBUG) console.log('Проверка/рендер формы авторизации');
    try {  !window.window.user.UserHash || !window.user.UserName && window.user.renderForm(); } catch(_) {}
    if (DEBUG) console.log('Форма авторизации обработана');

    // 4) Синхронизация из файла как источника истины
    if (DEBUG) console.log('Запуск синхронизации учётных данных из user.json');
    const synced = await (window.user.syncCredentialsFromFile ? window.user.syncCredentialsFromFile('user.json') : false);
    if (DEBUG) console.log('Результат синхронизации:', synced ? 'успешно' : 'нет данных или функция отсутствует');

    // 5) Установка куки для cordova-plugin-http, если есть
    if (DEBUG) console.log('Попытка применить куки к HTTP-плагину');
    try { await window.user.applyToHttpPlugin && window.user.applyToHttpPlugin('https://api.allfilmbook.ru'); } catch(_) {}
    if (DEBUG) console.log('Куки (если были) применены');

    // 6) Экспорт признака готовности
    window.__AUTH_INIT_DONE = true;
    if (DEBUG) console.log('Флаг __AUTH_INIT_DONE установлен в true');

    // 7) Если не синхронизировано — показать форму
    if (!synced) {
      if (DEBUG) console.log('Синхронизация не выполнена, показываем форму авторизации');
     // window.user.Avtorization_ShowHide();
      try { window.user.ensureAuthPrompt && window.user.ensureAuthPrompt(); } catch(_) {}
    } else {
      if (DEBUG) console.log('Синхронизация выполнена, форма авторизации не требуется');
    }
  } catch (e) {
    console.error('init-auth error:', e); // ошибки выводятся всегда
    window.__AUTH_INIT_DONE = true; // чтобы остальная логика не зависла
    Avtorization_ShowHide();
    if (DEBUG) console.log('Флаг __AUTH_INIT_DONE установлен после ошибки');
  }
});

