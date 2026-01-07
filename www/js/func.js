class Render {
    constructor() {
                    this.ErrorLoadTts=0;
    }


    OutFilmData(item,favoryte=0){
        var tmp='';var idFilm=item['kinopoiskId'];
        if(!idFilm)idFilm=item['filmId'];
       tmp +='<a href="artists.html?id='+idFilm+'" ><img src=\'img/artist.png\' class=\'bottons\'></a>'+
        '<a href="similar.html?id='+idFilm+'" ><img src=\'img/similar.png\' class=\'bottons\'></a>'+
        '<a href="equel.html?id='+idFilm+'"><img  src=\'img/equel.png\' class=\'bottons\'></a>'+
        '<a href="img.html?id='+idFilm+'"><img  src=\'img/img.png\' class=\'bottons\'></a>';
        if(favoryte==0)   
            tmp += '<img  src=\'img/add-icon-png-2468.png\' id="add_'+idFilm+'" onclick="addFavorites('+idFilm+')" class=\'bottons\'>';
        else
            tmp += '<img  src=\'img/minus-2-icon-14-256.png\' id="add_'+idFilm+'" onclick="minusFavorites('+idFilm+')" class=\'bottons\'>';

            if(item['nameRu']) tmp+= "<br><a href='torrent.html?q="+item['nameRu']+"&year="+item['year']+"\'><img  src=\'img/torrent.jpg\' class=\'bottonsU\'>"+item['nameRu']+ "</a>";
            if(item['nameOriginal']) tmp +=  "<br><a href='torrent.html?q="+item['nameOriginal']+"&year="+item['year']+"\'><img  src=\'img/torrent.jpg\' class=\'bottonsU\'>"+item['nameOriginal']+ "</a>";
            tmp +="<ul><li>Кп: "+item['ratingKinopoisk']+" IMDb:"+item['ratingImdb']+"</li><li>"+item['year']+"г.</li><li>"+item['filmLength']+" мин.</li><li>"+item['countries']+"</li><li>"+item['genres']+"</li></ul>"+item['description'];
return tmp;
    }

    OutFilmTemplate(item,PutDescription=0){
        var tmp='';
        var idFilm=item['kinopoiskId'];if(!idFilm)idFilm=item['filmId'];
        tmp = "<img src='https://imgfilm.allfilmbook.ru/?id="+idFilm+"' alt='"+item['nameRu']+"' class='MovesPicFace'>";
        tmp += "<div class='short-infobar' id='name_"+idFilm+"'><span class='short-quality'>"+item['nameRu']+"</span></div>";
        if (PutDescription==1) tmp += "<div class='overlay'>"+item['ratingKinopoisk']+" "+item['ratingImdb']+"</div>";
        tmp += "<div class='overlay' id='overlay_"+idFilm+"'></div>";
        tmp += "<div class='desc hide' id='desc_"+idFilm+"' >";
        if (PutDescription==1) tmp +=render.OutFilmData(item);
        tmp +="</div></div>";



        return tmp;
    }



}

const render= new Render;

