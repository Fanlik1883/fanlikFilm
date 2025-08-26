
//setTimeout(ListFilm(2019),0.1);

if(getCookie('SaveList')>1) 
	var list=getCookie('SaveList');
else 
	var list=1;

if(getCookie('SaveiD')>0) 
	var SaveiD=getCookie('SaveiD');
else 
    SaveiD=0;

var year=getCookie('year');
var tag=getCookie('tag');
var yearIndex=getCookie('yearIndex');
var tagIndex=getCookie('tagIndex');
var fildStr=''; //Куки
var idFilm=0;
const YearList = document.getElementById("year") 
YearList.addEventListener('change', updateYear);
YearList.selectedIndex=yearIndex;
const TagList = document.getElementById("tag") 
TagList.selectedIndex=tagIndex;
TagList.addEventListener('change',updateTag);


var UserId=getCookie("UserId");
var UserHash = getCookie("UserHash");
var UserName = getCookie("UserName");



if (!UserHash || !UserName) { // Если не авторизован
	document.getElementById('Avtorization_link').innerHTML += '<a href="#" onclick=\'Avtorization_ShowHide()\'>Войти</a>';
  }


ListFilm(year,list,tag);

function updateTag(){
	list=1;
	setCookieMy('SaveiD',0);
    setCookieMy('SaveList',list);
    if(TagList.selectedOptions.length-1>0){ tag='';  for (const entry of TagList.selectedOptions){tag+=entry.value+',';};tag=tag.slice(0, -1)}/************** */
    else tag=TagList[TagList.selectedIndex].value;
    SetMyCookie('tag',tag);
    SetMyCookie('tagIndex',TagList.selectedIndex);
    document.getElementById('ViewPort').innerHTML='';
    ListFilm(year,list,tag);
    SettingsPanelHide()
   // location.reload()
}

function updateYear(){
	list=1;
	   setCookieMy('SaveiD',0);
    setCookieMy('SaveList',list);
 year=YearList[YearList.selectedIndex].value;
 SetMyCookie('year',year);
 SetMyCookie('yearIndex',YearList.selectedIndex);
 document.getElementById('ViewPort').innerHTML='';
 
 ListFilm(year,list,tag);
 SettingsPanelHide()
 //location.reload()
}

function GoSearch(){

    document.getElementById('ViewPort').innerHTML='';
    var text=document.getElementById('TextSerch').value;
    ListFilm(0,0,'',text);
    //location.reload()
   }



function ListFilm(year = 0,list=0,genres='',text='') { 
	var ViewPort = document.getElementById('ViewPort');
	$.ajaxSetup({ timeout: 10000 });

	$.get('https://allfilmbook.ru/API/film/list/', { year: year, genres: genres, list: list, text: text}).done(function (data) {
		json = JSON.parse(data);
        if (json.length === 0) {
            req_out.innerHTML = "<img src='/img/not.png' style=' width: 100%;' title='' />";
        } else {
		json.forEach(function (item, i, json) {
			let liLast = document.createElement('div');
            liLast.className = "MovieCardFace";
            liLast.id = 'Movie_'+item['kinopoiskId'];
            liLast.dataset.list = list;
            liLast.addEventListener('click', function() { showDesc(item['kinopoiskId']); });
			liLast.innerHTML = renderedClass.OutFilmTemplate(item,1);
            ViewPort.append(liLast); 	
		})
	if(SaveiD>0) {
		document.querySelector('#Movie_'+SaveiD).scrollIntoView({ behavior: 'smooth' })
		SaveiD=0;
		}
    }
	})


}

function ListFilmN(n) { 
	var ViewPort = document.getElementById('ViewPort');
	$.ajaxSetup({ timeout: 10000 });

	$.get('https://allfilmbook.ru/API/film/list/', { n: n}).done(function (data) {
		json = JSON.parse(data);
        if (json.length === 0) {
            req_out.innerHTML = "<img src='/img/not.png' style=' width: 100%;' title='' />";
        } else {
		json.forEach(function (item, i, json) {
			let liLast = document.createElement('div');
            liLast.className = "MovieCardFace";
            liLast.id = 'Movie_'+item['kinopoiskId'];
            liLast.addEventListener('click', function() { showDesc(item['kinopoiskId']); });
            liLast.innerHTML = renderedClass.OutFilmTemplate(item,1);
            ViewPort.append(liLast); 		
		})

	

    }

	})


}





const observer = new IntersectionObserver((entries) => {
    if ((window.scrollY > document.body.scrollHeight - 1500)&& window.scrollY > 5000 ) {
       
        list++;
        ListFilm(year,list,tag); 
        let dd = document.getElementById('load-more-button')
        observer.observe(dd);
    }
  }, {
    root: null, 
    threshold: 1.0,
  });
  let dd = document.getElementById('load-more-button')
  
  
  setTimeout(observer.observe(dd), 10000);
function showDesc (id){
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



function SettingsPanelHide() {
    if(document.getElementById("panel").classList[1]=='hide'){
        document.getElementById("panel").classList.remove("hide")
        document.getElementById("panel").classList.toggle("show")

    } else {
        document.getElementById("panel").classList.remove("show")
        document.getElementById("panel").classList.toggle("hide")
    }
}


function GoKinopoisk() {
cordova.plugins.clipboard.paste(function (text) {
    id=text.match(/\d+/);
    ListFilmN(id);

});
}


function setCookieMy(name,data) {
    setCookie(name, data, {
        expires: new Date(Date.now() + 86400 * 1000 * 30 * 12),
        path: '/'
    })

    }

    function addFavorites(id){
        $.post('https://allfilmbook.ru/API/film/rating/?film='+id+'&tip=2&r=1',  {UserName: UserName, UserHash: UserHash }).done(function (data) {
            document.getElementById("add_"+id).remove();
        })
    }
    
