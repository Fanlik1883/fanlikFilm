class ExitApp {
  constructor() {
    this.ErrorLoadTts = 0;
    this.setupExitHandler();
  }

  showExitConfirmation() {
    if (confirm('Закрыть приложение?')) {
      if (navigator.app && navigator.app.exitApp) {
        navigator.app.exitApp();
      } else {
        window.close();
      }
    }
  }

  setupExitHandler() {
    const self = this;
    if (typeof cordova !== 'undefined') {
      document.addEventListener(
        'backbutton',
        function (event) {
          event.preventDefault();
          self.showExitConfirmation();
        },
        false,
      );
    }
  }
}

const exitapp = new ExitApp();
