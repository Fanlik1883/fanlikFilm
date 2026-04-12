class Choose {
  constructor() {}

  addFavorites(id) {
    $.post('https://api.allfilmbook.ru/film/rating/?film=' + id + '&tip=2&r=1', { UserName: user.UserName, UserHash: user.UserHash }).done(function (data) {
      document.getElementById('add_' + id).remove();
    });
  }

  minusFavorites(id) {
    $.post('https://api.allfilmbook.ru/film/rating/?film=' + id + '&tip=2&r=0', { UserName: user.UserName, UserHash: user.UserHash }).done(function (data) {});
    document.getElementById('Movie_' + id).remove();
  }
}

const choose = new Choose();
