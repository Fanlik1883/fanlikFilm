
class Panel {
    constructor() {
        this.panel=document.getElementById("panel");
        this.loadmorebutton = document.getElementById('load-more-button');
        this.ViewPort=document.getElementById('ViewPort')
        
    }

    SettingsPanelHide() {
        if(this.panel.classList[1]=='hide'){
            this.panel.classList.remove("hide")
            this.panel.classList.toggle("show")

        } else {
            this.panel.classList.remove("show")
            this.panel.classList.toggle("hide")
        }
    }

    showDesc (id){
        if(document.getElementById("desc_"+id).classList[1]=="hide"){
            document.getElementById("desc_"+id).classList.remove("hide")
            document.getElementById("desc_"+id).classList.toggle("show")
            document.getElementById("name_"+id).classList.toggle("hide")
            setCookieMy('SaveiD',id);
        var listSt= parseInt(document.getElementById("Movie_"+id).dataset.list,10)
            setCookieMy('SaveList',listSt);

        } else {
            document.getElementById("desc_"+id).classList.remove("show")
            document.getElementById("desc_"+id).classList.toggle("hide")
            document.getElementById("name_"+id).classList.remove("hide")


        }

    }




}
const panel = new Panel();


class ExitApp {
    constructor() {
        this.ErrorLoadTts = 0;
        this.setupExitHandler();
    }

    showExitConfirmation() {
        if (confirm("Закрыть приложение?")) {
            if (navigator.app && navigator.app.exitApp) {
                navigator.app.exitApp();
            } else {
                window.close();
            }
        }
    }


    setupExitHandler() {
        const self = this;
        if (typeof cordova !== 'undefined') {
            document.addEventListener('backbutton', function(event) {
                event.preventDefault();
                self.showExitConfirmation();
            }, false);
        }

    }
}

const exitapp = new ExitApp();


class Films {
    constructor() {
        this.year=parseInt(getCookie('year') || 0, 10);
        this.tag=getCookie('tag') || '';
        this.TypeFilm=getCookie('TypeFilm') || '';
        this.TypeFilmIndex=parseInt(getCookie('TypeFilmIndex') || 0, 10);
        this.yearIndex=parseInt(getCookie('yearIndex') || 0, 10);
        this.tagIndex=parseInt(getCookie('tagIndex') || 0, 10);
        this.list=parseInt(getCookie('SaveList') || 0, 10);
        this.SaveiD=parseInt(getCookie('SaveiD') || 0, 10);
        this.YearList = document.getElementById("year")
        this.TagList = document.getElementById("tag") 
        this.TypeFilmList = document.getElementById("TypeFilm") 
        this.isLoad=0;
    }
    updateTag(){
        films.list=1;
        setCookieMy('SaveiD',0);
        setCookieMy('SaveList',films.list);
        if(films.TagList.selectedOptions.length-1>0)
            { films.tag='';  for (const entry of films.TagList.selectedOptions){films.tag+=entry.value+',';};films.tag=films.tag.slice(0, -1)}/************** */
        else 
            films.tag=films.TagList[films.TagList.selectedIndex].value;
        SetMyCookie('tag',films.tag);
        SetMyCookie('tagIndex',films.TagList.selectedIndex);
        panel.ViewPort.innerHTML='';
        films.ListFilm(films.year,films.list,films.tag,'',films.TypeFilm);
        panel.SettingsPanelHide()
    }

    updateYear(){
        films.list=1;
        setCookieMy('SaveiD',0);
        setCookieMy('SaveList',films.list);
        films.year=films.YearList [films.YearList.selectedIndex].value;
        SetMyCookie('year',films.year);
        SetMyCookie('yearIndex',films.YearList.selectedIndex);
        panel.ViewPort.innerHTML='';
        films.ListFilm(films.year,films.list,films.tag,'',films.TypeFilm);
        panel.SettingsPanelHide()

    }

    updateTypeFilm(){ 
        films.list=1;
        setCookieMy('SaveiD',0);
        setCookieMy('SaveList',films.list);
        films.TypeFilm=films.TypeFilmList[films.TypeFilmList.selectedIndex].value
        films.TypeFilmIndex=films.TypeFilmList.selectedIndex
        SetMyCookie('TypeFilm',films.TypeFilm);
        SetMyCookie('TypeFilmIndex',films.TypeFilmIndex);
        panel.ViewPort.innerHTML='';
        films.ListFilm(films.year,films.list,films.tag,'',films.TypeFilm);
        panel.SettingsPanelHide()

    }

    ListFilm(year = 0,list=0,genres='',text='', TypeFilm='') { 
        films.isLoad=1;
        $.ajaxSetup({ timeout: 10000 });
        $.get('https://api.allfilmbook.ru/film/list/', { year: year, genres: genres, list: list, text: text, TypeFilm: TypeFilm}).done(function (data) {
            films.isLoad=0;
            let json = JSON.parse(data);
            if (json.length === 0) {
                req_out.innerHTML = "<img src='/img/not.png' style=' width: 100%;' title='' />";
            } else {
            json.forEach(function (item, i, json) {
                let liLast = document.createElement('div');
                liLast.className = "MovieCardFace";
                liLast.id = 'Movie_'+item['kinopoiskId'];
                liLast.dataset.list = list;
                liLast.setAttribute('onclick', `panel.showDesc(${item['kinopoiskId']})`);
                liLast.innerHTML = render.OutFilmTemplate(item,1);
                panel.ViewPort.append(liLast); 	
           
           
            })
        if(films.SaveiD>0) {
            document.querySelector('#Movie_'+films.SaveiD).scrollIntoView({ behavior: 'smooth' })
            films.SaveiD=0;
            }
        }
        })


    }

    ListFilmN(n) { 
        $.ajaxSetup({ timeout: 10000 });
        $.get('https://api.allfilmbook.ru/film/list/', { n: n}).done(function (data) {
            let json = JSON.parse(data);
            if (json.length === 0) {
                panel.ViewPort.innerHTML = "<img src='/img/not.png' style=' width: 100%;' title='' />";
            } else {
            json.forEach(function (item, i, json) {
                let liLast = document.createElement('div');
                liLast.className = "MovieCardFace";
                liLast.id = 'Movie_'+item['kinopoiskId'];
                liLast.setAttribute('onclick', `panel.showDesc(${item['kinopoiskId']})`);
                liLast.innerHTML = render.OutFilmTemplate(item,1);
                panel.ViewPort.append(liLast); 		
            })
        }
        })

    }

    GoKinopoisk() {
        panel.ViewPort.innerHTML='';
        let text=document.getElementById('IdSearch').value;
        let id=text.match(/\d+/);
        films.ListFilmN(id[0]);
        panel.SettingsPanelHide();

    }

   GoSearch(){
        panel.ViewPort.innerHTML='';
        let text=document.getElementById('TextSearch').value;
        films.ListFilm(0,0,'',text);
        panel.SettingsPanelHide();
   }

   setupEventpanel(){
        this.setupEventYearList()
        this.setupEventTagList()
        this.setupEventTypeFilmList()

   }

    setupEventYearList() {
        films.YearList.addEventListener('change', this.updateYear);
        films.YearList.selectedIndex=this.yearIndex;
    }

    setupEventTagList() {
        films.TagList.selectedIndex=this.tagIndex;
        films.TagList.addEventListener('change',this.updateTag);
    }

    setupEventTypeFilmList() {
        films.TypeFilmList.selectedIndex=this.TypeFilmIndex;
        films.TypeFilmList.addEventListener('change',this.updateTypeFilm);
    }
}
const films = new Films();
films.setupEventpanel();

var UserHash = getCookie("user_hash") || '';
var UserName = getCookie("user_name") || '';



if (!UserHash || !UserName) {	Avtorization_ShowHide();}


    films.ListFilm(films.year,films.list,films.tag);


    const observer = new IntersectionObserver((entries) => {
        if (films.isLoad==0) {
            films.list++;
            films.ListFilm(films.year,films.list,films.tag,films.TypeFilm); 
            let dd = panel.loadmorebutton
            observer.observe(dd);
        }
    }, {
        root: null, 
        threshold: 0.2,
        rootMargin: '200px 0px'
    });
    let dd = panel.loadmorebutton
  
  
observer.observe(dd);

    function setCookieMy(name,data) {
        setCookie(name, data, {
            expires: new Date(Date.now() + 86400 * 1000 * 30 * 12),
            path: '/'
        })

        }

