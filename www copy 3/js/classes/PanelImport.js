class PanelImport {
  constructor() {}

  showDesc(id, noCookie = 0) {
    if (noCookie == 1) {
      cookie.setCookieMy('SaveiD', id, 1);
      let listValue = 1; // значение по умолчанию
      if (typeof films !== 'undefined' && films && films.list) {
        listValue = films.list;
      }
      cookie.setCookieMy('SaveList', listValue, 1);
    }

    let desc = document.getElementById('desc_' + id);
    if (desc.innerHTML == '') {
      this.GetDesc(id);
    } else {
      let name = document.getElementById('name_' + id);
      if (desc.classList[1] == 'hide') {
        desc.classList.remove('hide');
        desc.classList.toggle('show');
        name.classList.toggle('hide');
      } else {
        desc.classList.remove('show');
        desc.classList.toggle('hide');
        name.classList.remove('hide');
      }
    }
  }

  GetDesc(n) {
    $.get('https://api.allfilmbook.ru/film/list/', { n: n }).done(function (data) {
      json = JSON.parse(data);
      var req_out = document.getElementById('desc_' + n);
      // Проверяем, пустой ли массив результатов
      if (Array.isArray(json) && json.length === 0) {
        visualPanel.showNotification('Ничего не найдено');
        return; // Прерываем выполнение, так как нет данных
      }
      json.forEach(function (item, i, json) {
        req_out.innerHTML = render.OutFilmData(item) + '</div>';

        document.getElementById('overlay_' + item['kinopoiskId']).innerHTML = item['ratingKinopoisk'] + ' ' + item['ratingImdb'];
        document.getElementById('desc_' + item['kinopoiskId']).classList.remove('hide');
        document.getElementById('desc_' + item['kinopoiskId']).classList.toggle('show');
        document.getElementById('name_' + item['kinopoiskId']).classList.toggle('hide');
      });
    });
  }
}
const panelImport = new PanelImport();
