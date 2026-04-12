const films = new Films();
const panel = new Panel(films); 










if(films.list>1){
    films.ListFilm(films.year,films.list-1,films.tag,"","",films.ratingCritics);
    films.ListFilm(films.year,films.list,films.tag,"","",films.ratingCritics);
}else {
    films.ListFilm(films.year,films.list,films.tag,"","",films.ratingCritics);
}






// Функция для проверки прокрутки и инициализации observer
function initObserverIfScrolled() {
    if (window.scrollY > 6000) {
        const observer = new IntersectionObserver((entries) => {
            if (films.isLoad == 0) {
                films.list++;
                films.ListFilm(films.year, films.list, films.tag, films.TypeFilm,"",films.ratingCritics);
                let dd = panel.loadmorebutton;
                observer.observe(dd);
            }
        }, {
            root: null,
            threshold: 0.2,
            rootMargin: '200px 0px'
        });
        
        let dd = panel.loadmorebutton;
        observer.observe(dd);
        
        // Удаляем обработчик прокрутки после инициализации
        window.removeEventListener('scroll', initObserverIfScrolled);
    }
}


// И добавляем обработчик для случаев, когда пользователь будет прокручивать
window.addEventListener('scroll', initObserverIfScrolled);



