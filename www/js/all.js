    function addFavorites(id){
        $.post('https://api.allfilmbook.ru/film/rating/?film='+id+'&tip=2&r=1',  {UserName: UserName, UserHash: UserHash }).done(function (data) {
            document.getElementById("add_"+id).remove();
        })
    }