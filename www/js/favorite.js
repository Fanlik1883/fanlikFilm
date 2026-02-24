let SaveiD = parseInt(cookie.getCookie('SaveiD') || 0, 10);

kinopoiskFavorites();
function kinopoiskFavorites() {
  var req_out = document.getElementById('ViewPort');
  $.ajaxSetup({ timeout: 10000 });
  var finds = '';

  $.post('https://api.allfilmbook.ru/film/favorites/', { UserName: user.UserName, UserHash: user.UserHash }).success(function (data) {
    let json = JSON.parse(data);
    if (json.length === 0) {
      req_out.innerHTML = "<img src='/img/zero.jpg' style=' width: 100%;' title='' />";
    } else {
      var tmp;
      json.forEach(function (item, i, json) {
        let liLast = document.createElement('div');
        liLast.className = 'MovieCardFace';
        liLast.id = 'Movie_' + item['kinopoiskId'];
        liLast.addEventListener('click', () => panelImport.showDesc(item['kinopoiskId'], 1));

        tmp = "<img src='https://imgfilm.allfilmbook.ru/?id=" + item['kinopoiskId'] + "' alt='" + item['nameRu'] + "' class='MovesPicFace'>" + "<div class='short-infobar' id='name_" + item['kinopoiskId'] + "'><span class='short-quality'>" + item['nameRu'] + '</span></div>' + "<div class='overlay'>" + item['ratingKinopoisk'] + ' ' + item['ratingImdb'] + '</div>' + "<div class='desc hide' id='desc_" + item['kinopoiskId'] + "' >";
        liLast.innerHTML = tmp + render.OutFilmData(item, 1) + '</div>';
        ViewPort.append(liLast);
      });
      if (SaveiD > 0) {
        document.querySelector('#Movie_' + SaveiD).scrollIntoView({ behavior: 'smooth' });
        SaveiD = 0;
      }
    }
  });
}
