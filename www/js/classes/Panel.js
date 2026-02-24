class Panel {
    constructor(films) {
        this.films = films; // Сохраняем экземпляр films
        this.panel=document.getElementById("panel");
        this.loadmorebutton = document.getElementById('load-more-button');
        this.ViewPort=document.getElementById('ViewPort')
        this.Events()

        
    }

    Events(){
        this.bottonSetting=document.getElementById('bottonSetting')
        this.bottonSetting.addEventListener('click', () => this.SettingsPanelHide());
        this.bottonTextSearch=document.getElementById('BottonTextSearch')
        this.bottonTextSearch.addEventListener('click', () => this.films.GoSearch());
        this.bottonIdSearch=document.getElementById('BottonIdSearch')
        this.bottonIdSearch.addEventListener('click', () => this.films.GoKinopoisk());

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

}
