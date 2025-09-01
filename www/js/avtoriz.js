///----------------------------Добавляем  Пользователя---------------------------------
function AddUser_ShowHide() { // Активировать Registration Добавление обьявление
    var ModalWindowView = document.getElementById('Registration_Head');
    if (ModalWindowView.classList.value == "dm-overlay") {
        ModalWindowView.classList.remove("dm-overlay");
        ModalWindowView.classList.add('dm-overlayV');
    } else {
        ModalWindowView.classList.remove("dm-overlayV");
        ModalWindowView.classList.add("dm-overlay")
    }
}

function RegistrationPost() { // Отправить запрос

    var login = document.getElementById('Registration_login').value
    var password = document.getElementById('Registration_password').value


    $.ajaxSetup({timeout: 3000});
    $.get('https://allfilmbook.ru/API/user/Registration/', {login: login, password: password}).done(function (data) {

        if (data === "Ok") {
            AddUser_ShowHide()
            Avtorization_ShowHide()
        } else
            alert(data)
    })

}

///ххххххххххххххххххххххххххххххДобавляем  Пользователяххххххххххххххххххххххххххххххххххх

///----------------------------Авторизируемся---------------------------------
function Avtorization_ShowHide() { // Активировать Avtorization 
    var ModalWindowView = document.getElementById('Avtorization_Head');
    if (ModalWindowView.classList.value == "dm-overlay") {
        ModalWindowView.classList.remove("dm-overlay");
        ModalWindowView.classList.add('dm-overlayV');
    } else {
        ModalWindowView.classList.remove("dm-overlayV");
        ModalWindowView.classList.add("dm-overlay")
    }
}

function AvtorizationPost() { // Отправить запрос
    var login = document.getElementById('Avtorization_login').value
    var password = document.getElementById('Avtorization_password').value
    $.ajaxSetup({timeout: 3000});
    $.get('https://allfilmbook.ru/API/user/Authorization/mobile1.php', {login: login, password: password}).done(function (data) {

      dates = JSON.parse(data);
        if(dates.answer === 'Ok') {
            setCookieMy("UserId",1)
            setCookieMy("user_hash",dates.hash)
            setCookieMy("user_name",login)
            location.reload();
        
        }
        else
            alert(data)
    })

}

/*
if(GetCookie("fileUser")==null & GetCookie("UserHash")!=null & GetCookie("UserId")!=null){
 
        localStorage.setItem("FileUserHash",GetCookie("UserHash"));
        localStorage.setItem("FileUserId",GetCookie("UserId"));
        document.cookie = "fileUser=1; expires=" + new Date(new Date().setMonth(new Date().getMonth() + 1)).toUTCString() + "; path=/";
    }

    if(GetCookie("fileUser")==1 & GetCookie("UserHash")==null){
  
        tmp = localStorage.getItem("FileUserHash")
        tmp1 = localStorage.getItem("FileUserId")

        document.cookie = "UserHash="+tmp+"; expires=" + new Date(new Date().setMonth(new Date().getMonth() + 1)).toUTCString() + "; path=/";
        document.cookie = "UserId="+tmp1+"; expires=" + new Date(new Date().setMonth(new Date().getMonth() + 1)).toUTCString() + "; path=/";
    }
*/

    function GetCookie(cookie_name) // Получение куков
    {
      var results = document.cookie.match('(^|;) ?' + cookie_name + '=([^;]*)(;|$)');
    
      if (results)
        return (unescape(results[2]));
      else
        return null;
    }
    
    
