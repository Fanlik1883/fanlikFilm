
            kinopoiskSimilars();
            function kinopoiskSimilars() {
                let params = new URLSearchParams(document.location.search);
                fins = params.get('id');
                var req_out = document.getElementById('ViewPort');
                $.ajaxSetup({timeout: 10000});
                var finds = '';
                $.get('https://api.allfilmbook.ru/kinopoisk/get/similars/', {id: fins}).success(function (data) {
            
                    json = JSON.parse(data);
                    if (json.length === 0) {

            req_out.innerHTML = "<img src='img/zero.jpg' style=' width: 100%;' title='' />";
            visualPanel.showNotification('Ничего не найдено');
            setTimeout(() => {visualPanel.goBack();}, 1000);

        } else {
                    json.forEach(function (item, i, json) {
                        let liLast = document.createElement('div');
                        liLast.className = "MovieCardFace";
                        liLast.id = 'Movie_'+item['filmId'];
                        liLast.addEventListener('click', function() { panelImport.showDesc(item['filmId']); });
                        
                        liLast.innerHTML = render.OutFilmTemplate(item);
                        ViewPort.append(liLast); 		
                    })
                }
                })
            
            }
            










