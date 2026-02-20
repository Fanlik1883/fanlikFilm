



class Rejects {
  constructor() {
    this.finderSelect = document.getElementById("finder");
    this.ApiKeys = { 'Jackett': 'kh2xyu3wngydyxxbg1wa9xtgbozr9a4g', 'Jackett2': 'vz8j4dx3qaxj9uvw4wlaot0b88ad669s', 'JackettEng': 'f95hvcdjn0r6gexxk3y2n2cd5nzgz85c' };
  }

  pushMagnetDownload(magentLink){
    var error = '';
    $.ajax({
        url: 'https://api.allfilmbook.ru/torrent/api/torrents',
        method: 'POST',
        contentType: 'application/json',  
        data: JSON.stringify({
            magnet: magentLink
        }),
        success: function (response) {
         showNotification("🚀 Закачка начата!")
        },
        error: function (xhr, status, error) {
          errorCount++;

          let errorMessage = 'Не удалось загрузить данные';
          if (status === 'timeout') {
            errorMessage = 'Таймаут запроса';
          } else if (xhr.status === 401) {
            errorMessage = 'Ошибка авторизации';
          }

          if (errorCount < 3) {
            if (confirm(errorMessage + '. Повторить запрос?')) {
               pushMagnetDownload(magentLink)
            }
          } else {
            errorCount = 0;
            alert('Нет доступа к API.');
          }
        },
      });
  }







  FindJackett(findText, findTextEng,findyear, adressRequest) {
    var apikey = this.ApiKeys[adressRequest];
    var apiUrl;
    findText = findText || '';
    findTextEng = findTextEng || '';
    if(findText!='' && findTextEng!='' )
    {
      apiUrl = 'https://api.allfilmbook.ru/' + adressRequest + '/search2/' + findText+"/"+findTextEng;
    }
    else
    {
      if(findText=='')    findText=findTextEng;
      apiUrl = 'https://api.allfilmbook.ru/' + adressRequest + '/search/' + findText;

    }
    if(adressRequest=='Rutracker' && (findTextEng!='' ||findText!='')) apiUrl = 'https://api.allfilmbook.ru/magnet/get/?text=' + findText + '&year=' + findyear;
    if(adressRequest=='Jackett' ||adressRequest=='Jackett2'||adressRequest=='JackettEng')apiUrl = 'https://api.allfilmbook.ru/' + adressRequest + '/API/v2.0/indexers/all/results?apikey=' + apikey + '&Query=' + findText + ' ' + findyear;

  
    $.ajax({
      url: apiUrl,
      timeout: 30000,
      success: function (data) {
        var json = JSON.parse(JSON.stringify(data));

        var finds = json.Results.map(function (item) {
          if (typeof item.Link === 'string') {
            var hash = item.Link;
          }
          else {
            hash = item.MagnetUri;
          }

          function capitalizeWords(str) {
            if (!str || typeof str !== 'string') return str;
            
            return str.split(' ')
              .map(word => {
                if (!word) return word;
                return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
              })
              .join(' ');
          }
          var name =capitalizeWords(item.Title)
        //  var name = item.Title;
          var seeders = item.Seeders;
          var leechers = item.Peers;
          var trackersChecked = item.trackersChecked;
          var trackersCheckedFormatted = item.PublishDate;
          item.PublishDate = item.PublishDate.replace(" ", "T");
          var index = item.PublishDate.indexOf("T");
          trackersCheckedFormatted = trackersCheckedFormatted.substring(0, index);
          var size = item.Size;
          var Category = item.Category;
          var description = item.Description;
          var sizeGb = (size / (1024 * 1024 * 1024)).toFixed(2);

          var outputData = {
            status: 0,
            headData: trackersCheckedFormatted,
            link: hash,
            description: description,
            name: name,
            seeders: seeders,
            leechers: leechers,
            Category: Category,
            comments: seeders + "/" + leechers + "/" + sizeGb + "Gb"
          };

          RenderTracker.OutMass.push(outputData);
        });

        RenderTracker.renderTable();
      },
      error: function (error) {
        console.error(error);
        return null;
      }
    });

  }
  RunSearch() {
    const selectedOptions = Array.from(this.finderSelect.selectedOptions);
    const values = selectedOptions.map(option => option.value).filter(value => value !== '');
    values.forEach(function (item, i) {
      RejectTracker.FindJackett(AnalisTracker.FildFindString.value,AnalisTracker.FildFindStringEng.value, AnalisTracker.FildFindYear.value, item);
    })
    return;

  }
}

class renderMagnet {
  constructor() {
    this.OutMass = [];
    this.ViewOutput = document.getElementById("ViewOutput")
    AnalisTracker.FilterList.addEventListener('change', this.renderTable);
    this.platform = (window.cordova && window.cordova.platformId) 
    ? window.cordova.platformId 
    : 'browser';

  }



  hideConfigPanel() {
    var ConfigPanel = document.getElementById("ConfigPanel");
    if (ConfigPanel.style.display == "none") ConfigPanel.style.display = 'block'
    else ConfigPanel.style.display = "none";
  }
 
  renderTable() {
    $('#ViewOutput').empty();
    var uniqueLinks = [];

    // Удаляем дубликаты по ссылке
    var result = RenderTracker.OutMass.filter((item) => {
      if (!uniqueLinks.includes(item.link)) {
        uniqueLinks.push(item.link);
        return true;
      }
      return false;
    });
    RenderTracker.OutMass = result;

    var finds = '';
    
    RenderTracker.OutMass.forEach(function (item, i) {
      var link = item.link;
      var title = item.name;
      var comments = item.comments;
      var headData = item.headData;
      var Category = item.Category;
      var description = item.description;
      var HighLine = '';
      
      if (AnalisTracker.highLicher(item.seeders, item.leechers)) HighLine = 'green';
      title = AnalisTracker.highlightText(title);
      if (AnalisTracker.onlyRus == 0) title = AnalisTracker.highlightText(title, 1);

      // 1. Проверка типа (Category)
      if (!AnalisTracker.isTypeSelected(Category)) {
        return;
      }
      
      // 2. Проверка текстового фильтра
      var filterText = AnalisTracker.FilterList.value.trim();
      if (filterText.length >= 3 && !item.name.toLowerCase().includes(filterText.toLowerCase())) {
        return;
      }
      
      // 3. Проверка на русский язык и ключевые слова (новый подход)
      if (AnalisTracker.onlyRus.checked == true) {
        var itemName = item.name;
        var hasRussianLetters = /[а-яё]/i.test(itemName);
        
        // Если есть русские буквы - пропускаем дальше
        if (hasRussianLetters) {
          // Ничего не делаем, русские буквы есть - элемент подходит
        } 
        // Если русских букв НЕТ, проверяем по массиву ключевых слов
        else if (AnalisTracker.elementsToSearch && Array.isArray(AnalisTracker.elementsToSearch)) {
          var hasKeywordMatch = false;
          
          for (var j = 0; j < AnalisTracker.elementsToSearch.length; j++) {
            var pattern = AnalisTracker.elementsToSearch[j];
            if (!pattern) continue;
            
            // Пропускаем паттерн русских букв, так как мы его уже проверили
            if (pattern === "[а-я]+" || pattern === "[а-яё]+") {
              continue;
            }
            
            try {
              var regex;
              // Проверяем, является ли паттерн регулярным выражением
              if (pattern.startsWith('/') && pattern.endsWith('/')) {
                // Регулярное выражение с флагами
                var patternBody = pattern.slice(1, -1);
                var lastSlash = patternBody.lastIndexOf('/');
                if (lastSlash !== -1) {
                  var flags = patternBody.substring(lastSlash + 1);
                  patternBody = patternBody.substring(0, lastSlash);
                  regex = new RegExp(patternBody, flags);
                } else {
                  regex = new RegExp(patternBody, 'i');
                }
              } else {
                // Обычная строка - экранируем спецсимволы
                var escapedPattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                regex = new RegExp(escapedPattern, 'i');
              }
              
              if (regex.test(itemName)) {
                hasKeywordMatch = true;
                break;
              }
            } catch (e) {
              console.error('Ошибка в шаблоне поиска:', pattern, e);
              continue;
            }
          }
          
          // Если нет русских букв И нет совпадений с ключевыми словами - пропускаем элемент
          if (!hasKeywordMatch) {
            return;
          }
        } 
        // Если нет русского массива для проверки и нет русских букв - пропускаем
        else if (!hasRussianLetters) {
          return;
        }
      }
      const newItem = {
        id: AnalisTracker.FindId,
        headData: headData,
        link: link,
        title: item.name,
        comments: comments
      };
      const addedIndex = AnalisTracker.dataSave.push(newItem) - 1;
      // Если все проверки пройдены - выводим элемент
      if (RenderTracker.platform === 'android') {
        finds = finds + ' <tr class="' + HighLine + '"><td>' + headData + '</td><td>#<a href="#" onclick="DownloadSelectFile(\'' + link + '\','+addedIndex+')" title="' + description + '" >' + title + '</a></td><td><a href="#" onclick="RejectTracker.pushMagnetDownload(\'' + link + '\')">Скачать</></td><td>' + comments + '</td></tr>';
      }
      if (RenderTracker.platform === 'browser') {
        finds = finds + ' <tr class="' + HighLine + '"><td>' + headData + '</td><td><a href="' + link + '" onclick="magnetManager.selectMagnet('+addedIndex+')" title="' + description + '">' + title + '</a></td><td><a href="#" onclick="RejectTracker.pushMagnetDownload(\'' + link + '\')">Скачать</></td><td>' + comments + '</td></tr>';
      }
    });

    if (finds.length < 1) {
      finds = 'Ничего не найдено! Попробуйте без фильтров!';
    } else {
      finds = '<table border=1 style="width: 100%;"><tr><td></td><td>Имя</td><td>Скачать</td><td>seeders/leechers/Gb</td></tr>' + finds + '</table>';
    }

    ViewOutput.innerHTML = finds;
    finds = '';
  }

  renderTableClear() {
    this.OutMass = [];
    this.ViewOutput.innerHTML = '';
  }
}

class Analis {
  constructor() {
    this.dataSave=[];
    this.FindString = new URLSearchParams(document.location.search).get('q');
    this.FildFindString = document.getElementById("FindString")
    this.FildFindString.value = this.FindString;
    this.FindStringEng = new URLSearchParams(document.location.search).get('e');
    this.FildFindStringEng = document.getElementById("FindStringEn")
    this.FildFindStringEng.value = this.FindStringEng;
    this.FindYear = new URLSearchParams(document.location.search).get('year');
    this.FindId = new URLSearchParams(document.location.search).get('id') || 999999;
    this.FildFindYear = document.getElementById("FindYear");
    this.FildFindYear.value = this.FindYear;
    this.FilterList = document.getElementById("FilterList");
    this.FilterList.value = this.FindYear;
    this.typeRequest = document.getElementById('typeRequest');
    this.onlyRus = document.getElementById('onlyRus');
    this.onlyRus.checked=true
    this.onlyRusDiv = document.getElementById('onlyRusDiv');
    this.elementsToSearch = ["RUS","Syncmer", "NewComers", "WStudio", "Dragon", "seleZen","Kinosvalka","rutracker", "fenix","LostFilm","Ultradox","RuDub","HDRezka","RHS","NewStudio","BaibaKo","AlexFilm", "IdeaFilm","SOFTBOX"];
    this.setupEventonlyRus()
 





  }

 

      setupEventonlyRus() {
        this.onlyRus.checked=Boolean(this.onlyRus);
        this.onlyRusDiv.addEventListener('click',this.updateonlyRus);
    }
        updateonlyRus(){
        if (AnalisTracker.onlyRus.checked==false) {AnalisTracker.onlyRus.checked=true}
        else {AnalisTracker.onlyRus.checked=false}
        RenderTracker.renderTable();/*********** */
        //this.ratingCritics=Number(this.onlyRus.checked);


    }


  isTypeSelected(inputValues) {
    const selectedOptions = Array.from(this.typeRequest.selectedOptions);
    const values = selectedOptions.map(option => parseInt(option.value, 10)).filter(value => !isNaN(value));

    return values.some(selectedValue => {
      for (const inputValue of inputValues) {
        if (selectedValue % 1000 === 0) {
          const rangeEnd = selectedValue + 1000;
          if (inputValue >= selectedValue && inputValue < rangeEnd) {
            return true;
          }
        } else {
          if (selectedValue === inputValue) {
            return true;
          }
        }
      }
      return false;
    });
  }


  highlightText(text,rus=0) {
    var elementsToSearch;
    var style;
    if(rus==1){
       elementsToSearch = this.elementsToSearch;
       style='yellow';
    }
    else
      {elementsToSearch = ["720p", "720i", "H265", "H264", "H266", "H.265", "H.264", "H.266", "1080p", "1080i", "60 fps"];
      style='select';}
   
    var regex = new RegExp(`(${elementsToSearch.join('|')})`, 'gi');
    

    return text.replace(regex, "<b class=\'"+style+"\'>$1</b>");
  }

  highLicher(lich, pir) {
    if (lich > 9 || pir > 9) return true;
    else return false;
  }

  dellSuperfluous(text) {
    text = text.toLowerCase();
    var elementsToSearch = ["mp3", "wav", "fb2", "flac", "jpg", "jpeg"];
    return elementsToSearch.some(element => text.includes(element));
  }
}

class MagnetManager {
  constructor() {
    this.AllSelectMagnet = [];
    this.loadFromLocalStorage();
  }

  renderMagnetTable() {
    var $viewOutput = $('#ViewOutput');
    $viewOutput.empty();
    
    if (!magnetManager.AllSelectMagnet || magnetManager.AllSelectMagnet.length === 0) {
      $viewOutput.html('<div class="alert alert-info">Нет сохраненных magnet-ссылок</div>');
      return;
    }

    // Группируем по id
    var groupedData = {};
    
    magnetManager.AllSelectMagnet.forEach(function(item) {
      var data = item[0];
      var meta = item[1];
      
      if (!data || !meta || !data.id) return;
      
      if (!groupedData[data.id]) {
        groupedData[data.id] = [];
      }
      
      // Парсим дату для сортировки
      var timestamp = magnetManager.parseDateString(meta.now);
      
      groupedData[data.id].push({
        data: data,
        meta: meta,
        timestamp: timestamp
      });
    });

    // Сортируем каждую группу по дате (новые сверху)
    Object.keys(groupedData).forEach(function(id) {
      groupedData[id].sort(function(a, b) {
        return b.timestamp - a.timestamp;
      });
    });

    // Сортируем группы по дате первого элемента
    var sortedIds = Object.keys(groupedData).sort(function(idA, idB) {
      return groupedData[idB][0].timestamp - groupedData[idA][0].timestamp;
    });

    var html = '';
    
    sortedIds.forEach(function(id, groupIndex) {
      var group = groupedData[id];
      if (group.length === 0) return;
      
      html += magnetManager.renderMagnetGroup(id, group, groupIndex);
    });

    $viewOutput.html(html || '<div class="alert alert-warning">Нет данных для отображения</div>');
    
    // Инициализируем обработчики событий
    magnetManager.initMagnetEventHandlers();
  }

  renderMagnetGroup(id, items, groupIndex) {
    var firstItem = items[0];
    var hasMultiple = items.length > 1;
    var isExpanded = groupIndex === 0; // Первая группа развернута по умолчанию

    var html = '<div class="magnet-group" data-group-id="' + id + '">';
    html += '<div class="group-header" data-toggle="group-' + id + '">';
    html += '<div>';
    html += '<span class="group-id">ID: ' + id + '</span>';
    html += '<span class="group-count">' + items.length + '</span>';
    html += '</div>';
    html += '<div class="group-last-update">';
    html += firstItem.meta.now;
    html += '</div>';
    html += '</div>';
    
    html += '<div class="group-content" id="group-' + id + '" style="' + (isExpanded ? '' : 'display: none;') + '">';
    html += this.renderMagnetItem(firstItem, true, 0);
    
    if (hasMultiple) {
      html += '<div class="collapsed-items" id="collapsed-' + id + '" style="' + (isExpanded ? '' : 'display: none;') + '">';
      
      for (var i = 1; i < items.length; i++) {
        html += this.renderMagnetItem(items[i], false, i);
      }
      
      html += '</div>';
      html += '<div class="toggle-items">';
      html += '<button class="toggle-btn" data-toggle="collapsed-' + id + '">';
      html += (isExpanded ? 'Скрыть' : 'Показать') + ' остальные (' + (items.length - 1) + ')';
      html += '</button>';
      html += '</div>';
    }
    
    html += '</div>';
    html += '</div>';
    
    return html;
  }

  renderMagnetItem(item, isMain, index) {
    var data = item.data;
    var meta = item.meta;
    var dateParts = meta.now.split(', ');
    var datePart = dateParts[0] || '';
    var timePart = dateParts[1] || '';
    var itemClass = isMain ? 'main-item' : 'collapsed-item';
    var title = this.escapeHtml(data.title);
    var comments = this.escapeHtml(data.comments);
    
    var html = '<div class="' + itemClass + '" data-index="' + index + '">';
    html += '<div class="magnet-date">';
    html += '<span title="Время сохранения">' + datePart + ' в ' + timePart + '</span>';
    
    if (data.headData) {
      html += ' | <span title="Дата релиза">' + data.headData + '</span>';
    }
    
    html += '</div>';
    html += '<a href="#" onclick="DownloadSelectFile(\'' + data.link  + '\',0)" class="magnet-title">';
    html += title;
    html += '</a>';
    html += '<div class="magnet-comments">';
    html += comments;
    html += '</div>';
    html += '</div>';
    
    return html;
  }

  initMagnetEventHandlers() {
    var self = this;
    
    // Обработчики для заголовков групп
    $(document).off('click', '.group-header').on('click', '.group-header', function() {
      var groupId = $(this).data('toggle');
      var $groupContent = $('#' + groupId);
      var groupIdOnly = groupId.replace('group-', '');
      var $collapsedItems = $('#collapsed-' + groupIdOnly);
      var $toggleBtn = $(this).closest('.magnet-group').find('.toggle-btn');
      
      if ($groupContent.is(':visible')) {
        $groupContent.slideUp(300);
        $collapsedItems.slideUp(300);
        if ($toggleBtn.length) {
          $toggleBtn.text('Показать группу');
        }
      } else {
        $groupContent.slideDown(300);
        if ($collapsedItems.is(':visible')) {
          $collapsedItems.slideDown(300);
        }
        if ($toggleBtn.length) {
          $toggleBtn.text('Скрыть остальные');
        }
      }
    });

    // Обработчики для кнопок показа/скрытия
    $(document).off('click', '.toggle-btn').on('click', '.toggle-btn', function(e) {
      e.stopPropagation();
      var targetId = $(this).data('toggle');
      var $target = $('#' + targetId);
      var isCollapsed = $target.is(':visible');
      
      if (isCollapsed) {
        $target.slideUp(300);
        $(this).text('Показать остальные');
      } else {
        $target.slideDown(300);
        $(this).text('Скрыть остальные');
      }
    });
  }

  // Вспомогательные методы
  parseDateString(dateStr) {
    // Конвертируем "09.02.2026, 13:17:57" в Date
    var match = dateStr.match(/(\d{2})\.(\d{2})\.(\d{4}), (\d{2}):(\d{2}):(\d{2})/);
    if (match) {
      var day = match[1];
      var month = match[2];
      var year = match[3];
      var hour = match[4];
      var minute = match[5];
      var second = match[6];
      return new Date(year + '-' + month + '-' + day + 'T' + hour + ':' + minute + ':' + second);
    }
    return new Date();
  }

  escapeHtml(text) {
    if (!text) return '';
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Метод для форматирования даты с временем
  formatDateTime(date) {
    if (!date) {
      date = new Date();
    }
    
    // Используем toLocaleString с явными параметрами
    var day = date.getDate().toString().padStart(2, '0');
    var month = (date.getMonth() + 1).toString().padStart(2, '0');
    var year = date.getFullYear();
    var hours = date.getHours().toString().padStart(2, '0');
    var minutes = date.getMinutes().toString().padStart(2, '0');
    var seconds = date.getSeconds().toString().padStart(2, '0');
    
    return day + '.' + month + '.' + year + ', ' + hours + ':' + minutes + ':' + seconds;
  }

  // Метод для поиска индекса магнита по ссылке в данных
  findMagnetIndexByUrl(data) {
    for (var i = 0; i < this.AllSelectMagnet.length; i++) {
      var item = this.AllSelectMagnet[i];
      var storedData = item[0];
      
      // Проверяем наличие ссылки в данных
      var storedUrl = storedData.url || storedData.link || 
                     (typeof storedData === 'string' && storedData.startsWith('http') ? storedData : null);
      
      var newUrl = data.url || data.link || 
                  (typeof data === 'string' && data.startsWith('http') ? data : null);
      
      // Если оба имеют ссылки и они совпадают
      if (storedUrl && newUrl && storedUrl === newUrl) {
        return i;
      }
      
      // Дополнительная проверка: если данные полностью совпадают
      if (JSON.stringify(storedData) === JSON.stringify(data)) {
        return i;
      }
    }
    
    return -1;
  }

  // Проверка и добавление элемента с лимитом 99
  selectMagnet(index) {
    var data = AnalisTracker.dataSave[index];
    // Создаем текущую дату в формате день.месяц.год
    var now = { now: this.formatDateTime() };

    // Ищем, есть ли уже такой магнит
    var existingIndex = this.findMagnetIndexByUrl(data);
    
    if (existingIndex !== -1) {
      // Найден существующий магнит - обновляем дату и перемещаем в начало
      var existingMagnet = this.AllSelectMagnet[existingIndex];
      
      // Обновляем дату
      existingMagnet[1] = now;

      // Удаляем из текущей позиции
      this.AllSelectMagnet.splice(existingIndex, 1);
      
      // Добавляем в начало
      this.AllSelectMagnet.unshift(existingMagnet);
    } else {
      if (this.AllSelectMagnet.length >= 99) {
        this.AllSelectMagnet.pop();
      }
      
      // Добавляем новый элемент в начало массива
      this.AllSelectMagnet.unshift([data, now]);
    }
    this.saveToLocalStorage();
    
    return this.AllSelectMagnet[0]; // Возвращаем добавленный элемент
  }

  // Метод для проверки наличия ссылки
  hasMagnetWithUrl(url) {
    for (var i = 0; i < this.AllSelectMagnet.length; i++) {
      var item = this.AllSelectMagnet[i];
      var storedData = item[0];
      var storedUrl = storedData.url || storedData.link || 
                     (typeof storedData === 'string' && storedData === url ? url : null);
      
      if (storedUrl === url) {
        return true;
      }
    }
    
    return false;
  }

  // Метод для получения магнита по ссылке
  getMagnetByUrl(url) {
    for (var i = 0; i < this.AllSelectMagnet.length; i++) {
      var item = this.AllSelectMagnet[i];
      var storedData = item[0];
      var storedUrl = storedData.url || storedData.link || 
                     (typeof storedData === 'string' && storedData === url ? url : null);
      
      if (storedUrl === url) {
        return item;
      }
    }
    
    return null;
  }

  // Остальные методы
  loadFromLocalStorage() {
    try {
      var storedData = localStorage.getItem('AllSelectMagnet');
      if (storedData) {
        this.AllSelectMagnet = JSON.parse(storedData);
      } else {
        this.AllSelectMagnet = [];
      }
    } catch (error) {
      console.error('Ошибка при загрузке из LocalStorage:', error);
      this.AllSelectMagnet = [];
    }
  }

  saveToLocalStorage() {
    try {
      localStorage.setItem('AllSelectMagnet', JSON.stringify(this.AllSelectMagnet));
    } catch (error) {
      console.error('Ошибка при сохранении в LocalStorage:', error);
    }
  }

  getMagnetCount() {
    return this.AllSelectMagnet.length;
  }

  getAllMagnets() {
    return this.AllSelectMagnet;
  }

  clearAllMagnets() {
    this.AllSelectMagnet = [];
    this.saveToLocalStorage();
  }
}



AnalisTracker = new Analis();
RejectTracker = new Rejects();
RenderTracker = new renderMagnet();
magnetManager = new MagnetManager();



if (AnalisTracker.FildFindString.value || AnalisTracker.FildFindStringEng.value) {
    RejectTracker.FindJackett(AnalisTracker.FildFindString.value,AnalisTracker.FildFindStringEng.value, '', "Magnet");
//RejectTracker.FindJackett(AnalisTracker.FildFindString.value,'', AnalisTracker.FildFindYear.value, "Rutracker")
} else {

    if (typeof magnetManager !== 'undefined' && magnetManager.renderMagnetTable) {
      magnetManager.renderMagnetTable();
  } else {
      alert('RenderTracker не инициализирован');
  }

}


function checkMagnet(text) {
  text = text.toLowerCase();
  if (text.startsWith("magnet")) {
    return 1;
  } else {
    return 0;
  }
}


function DownloadSelectFile(url,index) {
 
  var $magnets = checkMagnet(url);
  if ($magnets == 1) { 
    openFileInExternalAppMagnet(url);
    if (index>0)  magnetManager.selectMagnet(index);
    return 0; }
  function simpleHash() {
    var currentDate = new Date();
    fileURL = currentDate.getFullYear() + (currentDate.getMonth() + 1) + currentDate.getDate() + currentDate.getHours() + currentDate.getMinutes() + currentDate.getSeconds();
    return fileURL;
  }
  SelectFileData = simpleHash() + '.torrent';
  var fileTransfer = new FileTransfer();
  var fileURL = cordova.file.dataDirectory + 'files/' + SelectFileData;
  var fileURI = encodeURI(url);



  setTimeout(function () {
    fileTransfer.download(
      fileURI,
      fileURL,
      function (entry) {
        openFileInExternalApp(fileURL);
        showNotification('Загрузка ' + SelectFileData + ' завершена.');

      },
      function (error) {
        let message;
        const errorMessages = [
          'Файл не найден',
          'Недопустимый URL', 
          'Ошибка подключения',
          'Отмена операции',
          'Файл не был изменен',
          'Нет соответствия кода ошибки'
        ];
        if(error.code < 1 && error.code > 5) error.code=6
        showNotification('Произошла ошибка загрузки: ' + fileURL + ' ' + errorMessages[error.code]); //error.source
      }
    );
  }, 200);

}



function openFileInExternalApp(url) {
  cordova.plugins.fileOpener2.open(
    url,
    'application/x-bittorrent'
  );
}
function openFileInExternalAppMagnet(url) {
  cordova.InAppBrowser.open(url, '_system');
}










function showNotification(html) {
  var notification = document.createElement('div');
  notification.classList.add('notification');
  notification.innerHTML = html;
  document.body.appendChild(notification);
  setTimeout(() => {
    notification.style.opacity = '0';
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 1000);
  }, 6000);
}



function openExternalURL(url) {
  cordova.plugins.globalization.openURL(url);
}
var errorCount=0;