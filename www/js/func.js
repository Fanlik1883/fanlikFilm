class Render {
    constructor() {
                    this.ErrorLoadTts=0;
    }
    removeSymbols(str) {
        if (str === undefined || str === null || str === '')  return '';
        var symbols = [',', '.', '/', '"', "'", '*', '^', ';',':'];
        var chars = [];
        
        for (var i = 0; i < str.length; i++) {
            var char = str.charAt(i);
            var isSymbol = false;
            
            for (var j = 0; j < symbols.length; j++) {
                if (char === symbols[j]) {
                    isSymbol = true;
                    break;
                }
            }
            
            chars.push(isSymbol ? ' ' : char);
        }
        
        return chars.join('').replace(/\s+/g, ' ').trim();
    }

    OutFilmData(item,favoryte=0){
        var tmp='';var idFilm=item['kinopoiskId'];
        if(!idFilm)idFilm=item['filmId'];
       tmp +='<a href="artists.html?id='+idFilm+'" ><img src=\'img/artist.png\' class=\'bottons\'></a>'+
        '<a href="similar.html?id='+idFilm+'" ><img src=\'img/similar.png\' class=\'bottons\'></a>'+
        '<a href="equel.html?id='+idFilm+'"><img  src=\'img/equel.png\' class=\'bottons\'></a>'+
        '<a href="img.html?id='+idFilm+'"><img  src=\'img/img.png\' class=\'bottons\'></a>'+
        "<a href='torrent.html?q="+this.removeSymbols(item['nameRu'])+"&e="+this.removeSymbols(item['nameOriginal'])+"&year="+item['year']+"'><img  src='img/torrent.jpg' class='bottons'></a>";
        
        if(favoryte==0)   
            tmp += '<img  src=\'img/add-icon-png-2468.png\' id="add_'+idFilm+'" onclick="choose.addFavorites('+idFilm+')" class=\'bottons\'>';
        else
            tmp += '<img  src=\'img/minus-2-icon-14-256.png\' id="add_'+idFilm+'" onclick="choose.minusFavorites('+idFilm+')" class=\'bottons\'>';
            tmp +="<hr><a href='https://www.kinopoisk.ru/film/"+idFilm+"/' target='_blank'>Кп:"+item['ratingKinopoisk']+"</a> <a href='https://www.imdb.com/find/?q="+this.removeSymbols(item['nameOriginal'] || item['nameRu'])+"' target='_blank'>IMDb:"+item['ratingImdb']+"</a> Крит.: "+Number(item.ratingFilmCritics)+"<ul><li>"+item['year']+"г.</li><li>"+item['filmLength']+" мин.</li><li>"+item['countries']+"</li><li>"+item['genres']+"</li></ul>"+item['description'];
return tmp;
    }

    OutFilmTemplate(item,PutDescription=0){
        var tmp='';
        var idFilm=item['kinopoiskId'];if(!idFilm)idFilm=item['filmId'];
        tmp = "<img src='https://imgfilm.allfilmbook.ru/?id="+idFilm+"' alt='"+item['nameRu']+"' class='MovesPicFace'>";
        tmp += "<div class='short-infobar' id='name_"+idFilm+"'><span class='short-quality'>"+(item['nameRu'] || item['nameOriginal'])+"</span></div>";
        if (PutDescription==1) tmp += "<div class='overlay'>"+item['ratingKinopoisk']+"<br>"+item['ratingImdb']+"<br>"+item['ratingFilmCritics'] +"</div>";
        tmp += "<div class='overlay' id='overlay_"+idFilm+"'></div>";
        tmp += "<div class='desc hide' id='desc_"+idFilm+"' >";
        if (PutDescription==1) tmp +=render.OutFilmData(item);
        tmp +="</div></div>";
        return tmp;
    }



}

const render= new Render;


class VisualPanel {
    constructor() {
        setTimeout(() => {this.initBack();}, 500);
    }

    initBack(){
        this.bottonBack=document.getElementById('bottonBack');
        this.bottonBack.addEventListener('click', this.goBack);

    }
    goBack(){
        window.history.back();
    }

    //  функция для уведомлений 
showNotification(html) {
    const notification = document.createElement('div');
    notification.classList.add('notification');
    notification.innerHTML = html;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 1000);
    }, 8000);
}
}
const visualPanel = new VisualPanel();


