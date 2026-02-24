


class VisualPanel {
    constructor() {
        setTimeout(() => {this.initBack();}, 500);
    }

    initBack(){
        this.bottonBack=document.getElementById('bottonBack');
        if(this.bottonBack) this.bottonBack.addEventListener('click', this.goBack);

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


