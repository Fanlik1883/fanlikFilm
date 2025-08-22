  
class RejectsClass {
    constructor() { 
      this.finderSelect=document.getElementById("finder");
      this.ApiKeys = { 'Jackett': 'kh2xyu3wngydyxxbg1wa9xtgbozr9a4g', 'Jackett2': 'vz8j4dx3qaxj9uvw4wlaot0b88ad669s' , 'JackettEng': 'f95hvcdjn0r6gexxk3y2n2cd5nzgz85c'}; 
    }
   FindJackett(findText,findyear,adressRequest)  {
    var apikey=this.ApiKeys[adressRequest];
     var apiUrl = 'https://allfilmbook.ru/API/'+adressRequest+'/API/v2.0/indexers/all/results?apikey='+apikey+'&Query=' + findText+' '+findyear;
  
    $.ajax({
      url: apiUrl,
      timeout: 30000,
      success: function(data) {
        var currentDomain = window.location.origin; 
        var Domain = "https://allfilmbook.ru/API/"+adressRequest+"/";
        var json = JSON.parse(JSON.stringify(data));
        var finds = json.Results.map(function(item) {
          if (typeof item.Link === 'string') {
            var hash = item.Link;
          }                        
          else {
             hash = item.MagnetUri ;
          }
          var name = item.Title;
          var seeders = item.Seeders;
          var leechers = item.Peers;
          var trackersChecked = item.trackersChecked;
          var trackersCheckedFormatted = item.PublishDate;
          var index = item.PublishDate.indexOf("T");
          trackersCheckedFormatted = trackersCheckedFormatted.substring(0, index);
          var size = item.Size;
          var Category = item.Category;
          var description = item.Description ;
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
            comments: seeders+"/"+leechers+"/"+sizeGb+"Gb"
          };
          
          RenderTracker.OutMass.push(outputData); 
        });
  
        RenderTracker.renderTable();
      },
      error: function(error) {
        console.error(error);
        return null;
      }
    });
  
  }
  RunSearch(){
   const selectedOptions = Array.from(this.finderSelect.selectedOptions);
      const values = selectedOptions.map(option => option.value).filter(value => value !== '');
      values.forEach(function (item, i) {
        RejectTracker.FindJackett(AnalisTracker.FildFindString.value,AnalisTracker.FildFindYear.value,item);
      })
      return ;

  }
  }
  
  class renderClass {
    constructor() { 
      this.OutMass = []; 
      this.ViewOutput=document.getElementById("ViewOutput") 
      AnalisTracker.FilterList.addEventListener('change',this.renderTable);
      this.platform=cordova.platformId;
//      this.FilterTorrent = {'film': ["mp3", "wav", "fb2","flac","jpg","jpeg"],
 //   }
       
      
     }
  hideConfigPanel(){
    var ConfigPanel=document.getElementById("ConfigPanel");
    if(ConfigPanel.style.display=="none") ConfigPanel.style.display='block'
     else ConfigPanel.style.display="none";
  }   
    // Функция для вывода данных в виде таблицы
  renderTable() {
    $('#ViewOutput').empty();
  var uniqueLinks = [];
  
  var result = RenderTracker.OutMass.filter((item) => {
    if (!uniqueLinks.includes(item.link)) {
      uniqueLinks.push(item.link);
      return true;
    }
    return false;
  });
  RenderTracker.OutMass=result;
  
  
  var finds=''
        RenderTracker.OutMass.forEach(function (item, i) {
            var link = item.link;
            var title = item.name;
            var comments = item.comments;
            var headData = item.headData;
            var magnet=checkMagnet(link);
            var Category=item.Category;
            var description=item.description;
              var HighLine='';
             if(AnalisTracker.highLicher(item.seeders,item.leechers)) HighLine='green';
              title = AnalisTracker.highlightText(title);
              
              if (AnalisTracker.isTypeSelected(Category)){
                if (AnalisTracker.FilterList.value.trim().length >1) {
      if (item.name.toLowerCase().includes(AnalisTracker.FilterList.value.toLowerCase())){
  
              if(magnet==0 &&  RenderTracker.platform ==='android')   finds = finds + ' <tr class="'+HighLine+'"><td>' + headData + '</td><td><a href="#" onclik="openFileInExternalAppMagnet(\''+link+'\')" >#</a><a href="#" onclick="DownloadSelectFile(\''+link+'\')" title="' + description + '" >' + title + '</a></td><td>' + comments + '</td></tr>';
              if(magnet==1 &&  RenderTracker.platform ==='android')   finds = finds + ' <tr class="'+HighLine+'"><td>' + headData + '</td><td><a href="#" onclick="openFileInExternalAppMagnet(\''+link+'\')" title="' + description + '">' + title + '</a></td><td>' + comments + '</td></tr>';
              if(RenderTracker.platform ==='browser') finds = finds + ' <tr class="'+HighLine+'"><td>' + headData + '</td><td><a href="'+link+'" title="' + description + '">' + title + '</a></td><td>' + comments + '</td></tr>';
            }
  
      }else {
  
              if(magnet==0 &&  RenderTracker.platform ==='android')   finds = finds + ' <tr class="'+HighLine+'"><td>' + headData + '</td><td><a href="#" onclik="openFileInExternalAppMagnet(\''+link+'\')" >#</a><a href="#" onclick="DownloadSelectFile(\''+link+'\')" title="' + description + '">' + title + '</a></td><td>' + comments + '</td></tr>';
              if(magnet==1 &&  RenderTracker.platform ==='android')   finds = finds + ' <tr class="'+HighLine+'"><td>' + headData + '</td><td><a href="#" onclick="openFileInExternalAppMagnet(\''+link+'\')" title="' + description + '">' + title + '</a></td><td>' + comments + '</td></tr>';
              if( RenderTracker.platform ==='browser') finds = finds + ' <tr class="'+HighLine+'"><td>' + headData + '</td><td><a href="'+link+'" title="' + description + '">' + title + '</a></td><td>' + comments + '</td></tr>';
        }
  
  
  
            }
            })
  
  
  
  
            if (finds.length < 1) {
              finds = 'Ничего не найдено! Попробуйте без фильтров!';
            } else
              finds = '<table border=1 style="width: 100%;"><tr><td></td><td>Имя</td><td>seeders/leechers/Gb</td></tr>' + finds + '</table>';
  
            ViewOutput.innerHTML = finds;
            finds = '';
  
  }
  // Функция для вывода данных в виде таблицы Очистить
   renderTableClear() {
        this.OutMass=[];
        this.ViewOutput.innerHTML='';
    }
  }
  
  class textClass {
    constructor() { 
        this.FindString = new URLSearchParams(document.location.search).get('q');
        this.FildFindString=document.getElementById("FindString")
        this.FildFindString.value=this.FindString;
        this.FindYear= new URLSearchParams(document.location.search).get('year');
        this.FildFindYear=document.getElementById("FindYear") ;
        this.FildFindYear.value=this.FindYear;
        this.FilterList=document.getElementById("FilterList") ;
        this.typeRequest = document.getElementById('typeRequest');
     
        


     }

    isTypeSelected(inputValues) {
      const selectedOptions = Array.from(this.typeRequest.selectedOptions);
      const values = selectedOptions.map(option => parseInt(option.value, 10)).filter(value => !isNaN(value));
             
      return values.some(selectedValue => {
        for (const inputValue of inputValues) {
          if (selectedValue % 1000 === 0) {
            const rangeEnd = selectedValue + 1000;
            if (inputValue >= selectedValue  && inputValue < rangeEnd) {
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


    highlightText(text) {
           var elementsToSearch = ["720p", "720i", "H265", "H264", "H266", "H.265", "H.264", "H.266", "1080p", "1080i","60 fps","RUS"];
           var regex = new RegExp(`(${elementsToSearch.join('|')})`, 'gi');
    
      return text.replace(regex, '<b class=\'select\'>$1</b>');
    }
  
    highLicher(lich,pir) {
       if (lich>9 || pir>9) return true;
        else  return false;
    }
  
    dellSuperfluous(text) {
              text=text.toLowerCase();
              var elementsToSearch = ["mp3", "wav", "fb2","flac","jpg","jpeg"];
            return elementsToSearch.some(element => text.includes(element));
    }
  }
  
  AnalisTracker= new textClass();
  RejectTracker= new RejectsClass();
  RenderTracker= new renderClass();

  RejectTracker.FindJackett(AnalisTracker.FildFindString.value,AnalisTracker.FildFindYear.value,"Jackett");
  RejectTracker.FindJackett(AnalisTracker.FildFindString.value,AnalisTracker.FildFindYear.value,"Jackett2")
   //   RejectTracker.FindJackett(FindString,year,"JackettEng")
  
  
      function checkMagnet(text) {
      text = text.toLowerCase();
      if (text.startsWith("magnet")) {
          return 1;
      } else {
          return 0;
      }
  }
  
  
     
  
  
  
  
  function DownloadSelectFile(url) {
  
    
  function simpleHash() {
      var currentDate = new Date();
      fileURL = currentDate.getFullYear()  + (currentDate.getMonth() + 1)  + currentDate.getDate()  + currentDate.getHours()  + currentDate.getMinutes()  + currentDate.getSeconds()  ;
  
      return fileURL;
  }
  SelectFileData=simpleHash()+'.torrent';
   
  
    var fileTransfer = new FileTransfer();
    var fileURL = cordova.file.dataDirectory +'files/' + SelectFileData; // Путь, по которому будет сохранен файл +'Download/'
   
    
    var fileURI = encodeURI(url);
    //var fileURI = url;
    
  
    setTimeout(function() { //fileEntry.toURL()
    fileTransfer.download(
        fileURI,
        fileURL,
        function(entry) {
          openFileInExternalApp(fileURL);
          showNotification('Загрузка '+SelectFileData+' завершена.');
  
        },
        function(error) {
           let message;
  
          switch (error.code) {
              case 1:
                  message = 'Файл не найден';
                  break;
              case 2:
                  message = 'Недопустимый URL';
                  break;
              case 3:
                  message = 'Ошибка подключения';
                  break;
              case 4:
                  message = 'Отмена операции';
                  break;
              case 5:
                  message = 'Файл не был изменен';
                  break;
              default:
                  message = 'Нет соответствия кода ошибки';
          }
  
          showNotification('Произошла ошибка загрузки: '+fileURL +' ' + message); //error.source
   
  
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
  