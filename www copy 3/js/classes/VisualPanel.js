class VisualPanel {
    constructor() {
        setTimeout(() => { this.initBack(); }, 500);
        this.initRatingModal(); // создаём модальное окно
    }

    initBack() {
        this.bottonBack = document.getElementById('bottonBack');
        if (this.bottonBack) this.bottonBack.addEventListener('click', this.goBack);
    }

    goBack() {
        window.history.back();
    }

    // --- Методы для оценки фильма ---
    initRatingModal() {
        const modalDiv = document.createElement('div');
        modalDiv.className = 'rating-modal';
        modalDiv.id = 'ratingModal';
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'rating-modal-content';
        contentDiv.innerHTML = `
            <h3>Оцените фильм</h3>
            <div class="rating-buttons">
                ${[1, 2, 3, 4, 5].map(grade => `
                    <button class="rating-circle" data-grade="${grade}">${grade}</button>
                `).join('')}
            </div>
            <button id="closeRatingModal" style="margin-top:15px; padding:5px 10px;">Закрыть</button>
        `;
        
        modalDiv.appendChild(contentDiv);
        document.body.appendChild(modalDiv);
        
        this.ratingModal = modalDiv;
        this.currentFilmId = null;
        
        // Обработчики событий
        document.querySelectorAll('.rating-circle').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const grade = parseInt(e.target.dataset.grade);
                if (this.currentFilmId) {
                    this.sendRating(this.currentFilmId, grade);
                }
                this.closeRatingModal();
            });
        });
        
        const closeBtn = document.getElementById('closeRatingModal');
        if (closeBtn) closeBtn.addEventListener('click', () => this.closeRatingModal());
        
        modalDiv.addEventListener('click', (e) => {
            if (e.target === modalDiv) this.closeRatingModal();
        });
    }

    showRatingWindow(filmId) {
        if (!this.ratingModal) this.initRatingModal();
        this.currentFilmId = filmId;
        this.ratingModal.style.display = 'flex';
    }

    closeRatingModal() {
        if (this.ratingModal) this.ratingModal.style.display = 'none';
        this.currentFilmId = null;
    }

sendRating(filmId, grade) {
    const url = `https://api.allfilmbook.ru/kinopoisk/rating/?film=${filmId}&tip=1&grade=${grade}`;
    
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json(); // парсим JSON
        })
        .then(data => {
            if (data && data.result === 'ok') {
                // Успешная оценка
                this.showNotification(`✅ Оценка ${grade} для фильма ${filmId} успешно сохранена!`);
            } else {
                // Сервер вернул ответ, но не "ok"
                console.warn('Unexpected response:', data);
                this.showNotification(`❌ Ошибка: сервер вернул неожиданный ответ.`);
            }
        })
        .catch(err => {
            console.error('Ошибка запроса:', err);
            this.showNotification(`❌ Не удалось отправить оценку: ${err.message}`);
        });
}

    // Функция для уведомлений
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

// Глобальная функция для вызова из onclick
window.showRatingWindow = function(filmId) {
    visualPanel.showRatingWindow(filmId);
};