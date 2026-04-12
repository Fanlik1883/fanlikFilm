
class Films {
  constructor() {
    this.year = parseInt(cookie.getCookie('year') || 0, 10);
    this.tag = cookie.getCookie('tag') || '';
    this.TypeFilm = cookie.getCookie('TypeFilm') || '';
    this.TypeFilmIndex = parseInt(cookie.getCookie('TypeFilmIndex') || 0, 10);
    this.yearIndex = parseInt(cookie.getCookie('yearIndex') || 0, 10);
    this.tagIndex = parseInt(cookie.getCookie('tagIndex') || 0, 10);
    this.list = parseInt(cookie.getCookie('SaveList') || 1, 10);
    this.SaveiD = parseInt(cookie.getCookie('SaveiD') || 0, 10);
    this.ratingCritics = parseInt(cookie.getCookie('ratingCritics') || 0, 10);
    this.YearList = document.getElementById('year');
    this.TagList = document.getElementById('tag');
    this.TypeFilmList = document.getElementById('TypeFilm');
    this.ratingCriticsCheckBox = document.getElementById('ratingCritics');
    this.ratingCriticsDiv = document.getElementById('ratingCriticsDiv');
    this.isLoad = 0;
    this.setupEventpanel();
    window.addEventListener('scroll', this.initObserverIfScrolled);
  }

  // Листинг при скролинге
  initObserverIfScrolled() {
    if (window.scrollY > 6000) {
      const observer = new IntersectionObserver(
        (entries) => {
          if (films.isLoad == 0) {
            films.list++;
            films.ListFilm(films.year, films.list, films.tag, films.TypeFilm, '', films.ratingCritics);
            let dd = panel.loadmorebutton;
            observer.observe(dd);
          }
        },
        {
          root: null,
          threshold: 0.2,
          rootMargin: '200px 0px',
        },
      );

      let dd = panel.loadmorebutton;
      observer.observe(dd);

      // Удаляем обработчик прокрутки после инициализации
      window.removeEventListener('scroll', films.initObserverIfScrolled);
    }
  }
  //Обновление Тегов при используюется в панели
  updateTag() {
    films.list = 1;
    cookie.setCookieMy('SaveiD', 0);
    cookie.setCookieMy('SaveList', films.list);
    if (films.TagList.selectedOptions.length - 1 > 0) {
      films.tag = '';
      for (const entry of films.TagList.selectedOptions) {
        films.tag += entry.value + ',';
      }
      films.tag = films.tag.slice(0, -1);
    } /************** */ else films.tag = films.TagList[films.TagList.selectedIndex].value;
    cookie.setCookieMy('tag', films.tag);
    cookie.setCookieMy('tagIndex', films.TagList.selectedIndex);
    panel.ViewPort.innerHTML = '';
    films.ListFilm(films.year, films.list, films.tag, '', films.TypeFilm, films.ratingCritics);
    panel.SettingsPanelHide();
  }

  //Обновление Года при используюется в панели
  updateYear() {
    films.list = 1;
    cookie.setCookieMy('SaveiD', 0);
    cookie.setCookieMy('SaveList', films.list);
    films.year = films.YearList[films.YearList.selectedIndex].value;
    cookie.setCookieMy('year', films.year);
    cookie.setCookieMy('yearIndex', films.YearList.selectedIndex);
    panel.ViewPort.innerHTML = '';
    films.ListFilm(films.year, films.list, films.tag, '', films.TypeFilm, films.ratingCritics);
    panel.SettingsPanelHide();
  }
  //Обновление Года при используюется в панели
  updateTypeFilm() {
    films.list = 1;
    cookie.setCookieMy('SaveiD', 0);
    cookie.setCookieMy('SaveList', films.list);
    films.TypeFilm = films.TypeFilmList[films.TypeFilmList.selectedIndex].value;
    films.TypeFilmIndex = films.TypeFilmList.selectedIndex;
    cookie.setCookieMy('TypeFilm', films.TypeFilm);
    cookie.setCookieMy('TypeFilmIndex', films.TypeFilmIndex);
    panel.ViewPort.innerHTML = '';
    films.ListFilm(films.year, films.list, films.tag, '', films.TypeFilm, films.ratingCritics);
    panel.SettingsPanelHide();
  }

  updateRatingCritics() {
    films.list = 1;
    cookie.setCookieMy('SaveiD', 0);
    cookie.setCookieMy('SaveList', films.list);
    if (films.ratingCriticsCheckBox.checked == false) {
      films.ratingCritics = 1;
      films.ratingCriticsCheckBox.checked = true;
    } else {
      films.ratingCritics = 0;
      films.ratingCriticsCheckBox.checked = false;
    }
    //films.ratingCritics=Number(films.ratingCriticsCheckBox.checked);
    cookie.setCookieMy('ratingCritics', films.ratingCritics);
    panel.ViewPort.innerHTML = '';
    films.ListFilm(films.year, films.list, films.tag, '', films.TypeFilm, films.ratingCritics);
    panel.SettingsPanelHide();
  }

  ListFilm(year = 0, list = 1, genres = '', text = '', TypeFilm = '', sortFilm = 0) {
    films.isLoad = 1;
    $.ajaxSetup({ timeout: 3000 });

    $.get('https://api.allfilmbook.ru/film/list/', {
      year: year,
      genres: genres,
      list: list,
      text: text,
      TypeFilm: TypeFilm,
      rating: sortFilm,
    })
      .done(function (data) {
        setTimeout(() => {
          films.isLoad = 0;
        }, 3000);
        let json = JSON.parse(data);
        if (json.length === 0) {
          visualPanel.showNotification('Завершение ленты фильмов! Смените настроки.');
          // panel.ViewPort.innerHTML += "<img src='img/not.png' style=' width: 100%;' title='' />";
        } else {
          json.forEach(function (item, i, json) {
            if (item.ratingKinopoisk + item.ratingImdb == 0 && sortFilm == 0) return;
            if (Number(item.ratingFilmCritics) == 0 && sortFilm == 1) return;
            let liLast = document.createElement('div');
            liLast.className = 'MovieCardFace';
            liLast.id = 'Movie_' + item['kinopoiskId'];
            liLast.dataset.list = list;
            //  liLast.addEventListener('click', function() { panelImport.showDesc(item['kinopoiskId'], 1);});
            liLast.setAttribute('onclick', 'panelImport.showDesc(' + item['kinopoiskId'] + ', 1)');
            // liLast.addEventListener('click', () => panelImport.showDesc(item['kinopoiskId'],1));
            // liLast.onclick = () => panelImport.showDesc(item['kinopoiskId'], 1);
            liLast.innerHTML = render.OutFilmTemplate(item, 1);
            panel.ViewPort.append(liLast);
          });

          if (films.SaveiD > 0) {
            document.querySelector('#Movie_' + films.SaveiD).scrollIntoView({ behavior: 'smooth' });
            films.SaveiD = 0;
          }
        }
      })
      .fail(function () {
        films.isLoad = 0;
        throw new Error('Ошибка при выполнении запроса к API');
      });
  }

  ListFilmN(n) {
    $.ajaxSetup({ timeout: 10000 });
    $.get('https://api.allfilmbook.ru/film/list/', { n: n }).done(function (data) {
      let json = JSON.parse(data);
      if (json.length === 0) {
        panel.ViewPort.innerHTML += "<img src='/img/not.png' style=' width: 100%;' title='' />";
      } else {
        json.forEach(function (item, i, json) {
          let liLast = document.createElement('div');
          liLast.className = 'MovieCardFace';
          liLast.id = 'Movie_' + item['kinopoiskId'];
          liLast.addEventListener('click', () => panelImport.showDesc(item['kinopoiskId'], 1));
          liLast.innerHTML = render.OutFilmTemplate(item, 1);
          panel.ViewPort.append(liLast);
        });
      }
    });
  }

  GoKinopoisk() {
    panel.ViewPort.innerHTML = '';
    let text = document.getElementById('IdSearch').value;
    let id = text.match(/\d+/);
    films.ListFilmN(id[0]);
    panel.SettingsPanelHide();
  }

  GoSearch() {
    panel.ViewPort.innerHTML = '';
    let text = document.getElementById('TextSearch').value;
    films.ListFilm(0, 0, '', text);
    panel.SettingsPanelHide();
  }

  setupEventpanel() {
    this.setupEventYearList();
    this.setupEventTagList();
    this.setupEventTypeFilmList();
    this.setupEventratingCriticsCheckBox();
  }

  setupEventYearList() {
    this.YearList.addEventListener('change', this.updateYear);
    this.YearList.selectedIndex = this.yearIndex;
  }

  setupEventTagList() {
    this.TagList.selectedIndex = this.tagIndex;
    this.TagList.addEventListener('change', this.updateTag);
  }

  setupEventTypeFilmList() {
    this.TypeFilmList.selectedIndex = this.TypeFilmIndex;
    this.TypeFilmList.addEventListener('change', this.updateTypeFilm);
  }
  setupEventratingCriticsCheckBox() {
    this.ratingCriticsCheckBox.checked = Boolean(this.ratingCritics);
    this.ratingCriticsDiv.addEventListener('click', this.updateRatingCritics);
  }
}
