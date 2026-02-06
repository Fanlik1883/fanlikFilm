



class Rejects {
  constructor() {
    this.finderSelect = document.getElementById("finder");
    this.ApiKeys = { 'Jackett': 'kh2xyu3wngydyxxbg1wa9xtgbozr9a4g', 'Jackett2': 'vz8j4dx3qaxj9uvw4wlaot0b88ad669s', 'JackettEng': 'f95hvcdjn0r6gexxk3y2n2cd5nzgz85c' };
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
          var name = item.Title;
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
      
      // Если все проверки пройдены - выводим элемент
      if (RenderTracker.platform === 'android') {
        finds = finds + ' <tr class="' + HighLine + '"><td>' + headData + '</td><td>#<a href="#" onclick="DownloadSelectFile(\'' + link + '\')" title="' + description + '" >' + title + '</a></td><td>' + comments + '</td></tr>';
      }
      if (RenderTracker.platform === 'browser') {
        finds = finds + ' <tr class="' + HighLine + '"><td>' + headData + '</td><td><a href="' + link + '" title="' + description + '">' + title + '</a></td><td>' + comments + '</td></tr>';
      }
    });

    if (finds.length < 1) {
      finds = 'Ничего не найдено! Попробуйте без фильтров!';
    } else {
      finds = '<table border=1 style="width: 100%;"><tr><td></td><td>Имя</td><td>seeders/leechers/Gb</td></tr>' + finds + '</table>';
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
    this.FindString = new URLSearchParams(document.location.search).get('q');
    this.FildFindString = document.getElementById("FindString")
    this.FildFindString.value = this.FindString;
    this.FindStringEng = new URLSearchParams(document.location.search).get('e');
    this.FildFindStringEng = document.getElementById("FindStringEn")
    this.FildFindStringEng.value = this.FindStringEng;
    this.FindYear = new URLSearchParams(document.location.search).get('year');
    this.FindId = new URLSearchParams(document.location.search).get('id');
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

AnalisTracker = new Analis();
RejectTracker = new Rejects();
RenderTracker = new renderMagnet();

RejectTracker.FindJackett(AnalisTracker.FildFindString.value,AnalisTracker.FildFindStringEng.value, '', "Magnet");
//RejectTracker.FindJackett(AnalisTracker.FildFindString.value,'', AnalisTracker.FildFindYear.value, "Rutracker")



function checkMagnet(text) {
  text = text.toLowerCase();
  if (text.startsWith("magnet")) {
    return 1;
  } else {
    return 0;
  }
}


function DownloadSelectFile(url) {
  var $magnets = checkMagnet(url);
  if ($magnets == 1) { openFileInExternalAppMagnet(url); return 0; }
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
