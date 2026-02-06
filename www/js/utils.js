class Cookie {
    constructor() {
        
    }
getCookie(e,t=!1){if(!e)return;let n=document.cookie.match(new RegExp("(?:^|; )"+e.replace(/([.$?*|{}()\[\]\\\/+^])/g,"\\$1")+"=([^;]*)"));if(n){let e=decodeURIComponent(n[1]);if(t)try{return JSON.parse(e)}catch(e){}return e}}
setCookie(e,t,n={path:"/"}){if(!e)return;(n=n||{}).expires instanceof Date&&(n.expires=n.expires.toUTCString()),t instanceof Object&&(t=JSON.stringify(t));let o=encodeURIComponent(e)+"="+encodeURIComponent(t);for(let e in n){o+="; "+e;let t=n[e];!0!==t&&(o+="="+t)}document.cookie=o}
deleteCookie(e){setCookie(e,null,{expires:new Date,path:"/"})}
setCookieMy(name,dates,isOnlyHere=0){let path='/';if (isOnlyHere==1)path = window.location.pathname; this.setCookie(name, dates, {expires: new Date(Date.now() + 86400 * 1000 * 30 * 12), path: path})}

}

const cookie = new Cookie();


class Choose {
    constructor() {
                
    }
    

    addFavorites(id){
        $.post('https://api.allfilmbook.ru/film/rating/?film='+id+'&tip=2&r=1',  {UserName: UserName, UserHash: UserHash })
        .done(function (data) {
            document.getElementById("add_"+id).remove();
        })
   }

    minusFavorites(id){
        $.post('https://api.allfilmbook.ru/film/rating/?film='+id+'&tip=2&r=0',  {UserName: UserName, UserHash: UserHash })
        .done(function (data) {
        })
        document.getElementById("Movie_"+id).remove();
    }


}

const choose = new Choose();