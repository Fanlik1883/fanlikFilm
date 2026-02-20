// Конфигурация
const API_BASE = 'https://api.allfilmbook.ru/torrent/api';

// Состояние приложения
let currentTorrents = [];
let currentStats = null;
let currentSettings = null;
let currentOffset = 0;
let currentLimit = 100;
let currentStatusFilter = '';
let totalTorrents = 0;
let currentDeleteHash = null;
// Храним текущий хеш для модального окна файлов
let currentFilesHash = null;
let currentFiles = [];

// Состояние файлового проводника
let currentFileManagerPath = '';
let currentFileManagerItems = [];
let pendingDeletePath = null;
let pendingDeleteType = null;

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
    checkHealth();
    loadStats();
    loadTorrents();
    loadSettings();
    setupEventListeners();
    
    // Автообновление каждые 5 секунд
    setInterval(() => {
        loadStats();
        loadTorrents();
    }, 5000);
});

// Настройка обработчиков событий
function setupEventListeners() {
    // Кнопка обновления
    document.getElementById('refreshBtn').addEventListener('click', () => {
        loadStats();
        loadTorrents();
        showNotification('Данные обновлены', 'success');
    });

    // Кнопка проводника
    document.getElementById('openFileManagerBtn').addEventListener('click', () => {
        openFileManager();
    });

    // Форма добавления торрента
    document.getElementById('addTorrentForm').addEventListener('submit', (e) => {
        e.preventDefault();
        addTorrent();
    });

    // Фильтры
    document.getElementById('applyFiltersBtn').addEventListener('click', () => {
        currentStatusFilter = document.getElementById('statusFilter').value;
        currentLimit = parseInt(document.getElementById('limitFilter').value) || 100;
        currentOffset = 0;
        loadTorrents();
    });

    // Настройки
    document.getElementById('showSettingsBtn').addEventListener('click', () => {
        const panel = document.getElementById('settingsPanel');
        panel.classList.toggle('hidden');
        if (!panel.classList.contains('hidden')) {
            loadSettings();
        }
    });

    document.getElementById('settingsForm').addEventListener('submit', (e) => {
        e.preventDefault();
        saveSettings();
    });

    // Модальное окно файлов: кнопки выбора
    document.getElementById('applySelectionBtn').addEventListener('click', () => {
        applyFileSelection();
    });
    
    document.getElementById('selectAllFilesBtn').addEventListener('click', () => {
        selectAllFiles(true);
    });
    
    document.getElementById('deselectAllFilesBtn').addEventListener('click', () => {
        selectAllFiles(false);
    });

    // Файловый проводник: навигация
    document.getElementById('fileManagerUpBtn').addEventListener('click', () => {
        navigateFileManagerUp();
    });
    
    document.getElementById('fileManagerRefreshBtn').addEventListener('click', () => {
        loadFileManagerList(currentFileManagerPath);
    });
    
    document.getElementById('fileManagerHomeBtn').addEventListener('click', () => {
        loadFileManagerList('');
    });

    // Модальное окно подтверждения удаления файла
    document.getElementById('confirmDeleteFileBtn').addEventListener('click', () => {
        if (pendingDeletePath) {
            deleteFileManagerItem(pendingDeletePath, pendingDeleteType);
        }
        closeConfirmDeleteFileModal();
    });
    
    document.getElementById('cancelDeleteFileBtn').addEventListener('click', () => {
        closeConfirmDeleteFileModal();
    });

    // Модальные окна
    setupModals();
}

// Настройка модальных окон
function setupModals() {
    const modals = document.querySelectorAll('.modal');
    const closeButtons = document.querySelectorAll('.close');
    
    closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            modals.forEach(modal => {
                modal.style.display = 'none';
            });
        });
    });

    window.addEventListener('click', (e) => {
        modals.forEach(modal => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    });

    // Модальное окно удаления торрента
    document.getElementById('cancelDeleteBtn').addEventListener('click', () => {
        document.getElementById('deleteModal').style.display = 'none';
    });

    document.getElementById('confirmDeleteBtn').addEventListener('click', () => {
        if (currentDeleteHash) {
            deleteTorrent(currentDeleteHash);
        }
        document.getElementById('deleteModal').style.display = 'none';
    });
}

// Проверка здоровья API
async function checkHealth() {
    try {
        const response = await fetch(`${API_BASE}/health`);
        const data = await response.json();
        
        const statusIndicator = document.querySelector('.status-indicator');
        const statusText = document.getElementById('statusText');
        
        if (data.status === 'ok') {
            statusIndicator.classList.add('connected');
            statusIndicator.classList.remove('disconnected');
            statusText.textContent = 'Подключено';
        }
    } catch (error) {
        console.error('Health check failed:', error);
        const statusIndicator = document.querySelector('.status-indicator');
        const statusText = document.getElementById('statusText');
        
        statusIndicator.classList.add('disconnected');
        statusIndicator.classList.remove('connected');
        statusText.textContent = 'Ошибка подключения';
    }
}

// Загрузка статистики
async function loadStats() {
    try {
        const response = await fetch(`${API_BASE}/stats`);
        currentStats = await response.json();
        renderStats();
    } catch (error) {
        console.error('Failed to load stats:', error);
        showNotification('Ошибка загрузки статистики', 'error');
    }
}

// Загрузка списка торрентов
async function loadTorrents() {
    try {
        let url = `${API_BASE}/torrents?limit=${currentLimit}&offset=${currentOffset}`;
        if (currentStatusFilter) {
            url += `&status=${currentStatusFilter}`;
        }
        
        const response = await fetch(url);
        const data = await response.json();
        
        currentTorrents = data.torrents;
        totalTorrents = data.total;
        
        renderTorrents();
        renderPagination();
    } catch (error) {
        console.error('Failed to load torrents:', error);
        showNotification('Ошибка загрузки торрентов', 'error');
    }
}

// Загрузка настроек
async function loadSettings() {
    try {
        const response = await fetch(`${API_BASE}/settings`);
        currentSettings = await response.json();
        
        document.getElementById('maxDownloads').value = currentSettings.max_concurrent_downloads;
        document.getElementById('downloadPath').value = currentSettings.download_base_path;
    } catch (error) {
        console.error('Failed to load settings:', error);
    }
}

// Добавление торрента
async function addTorrent() {
    const magnet = document.getElementById('magnetLink').value;
    const savePath = document.getElementById('savePath').value;
    const seedTime = document.getElementById('seedTime').value;
    
    const data = {
        magnet: magnet
    };
    
    if (savePath) data.save_path = savePath;
    if (seedTime) data.seed_time = parseInt(seedTime);
    
    try {
        const response = await fetch(`${API_BASE}/torrents`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        if (response.status === 201) {
            showNotification('Торрент успешно добавлен', 'success');
            document.getElementById('addTorrentForm').reset();
            loadTorrents();
            loadStats();
        } else {
            const error = await response.json();
            showNotification(`Ошибка: ${error.error}`, 'error');
        }
    } catch (error) {
        console.error('Failed to add torrent:', error);
        showNotification('Ошибка добавления торрента', 'error');
    }
}

// Удаление торрента
async function deleteTorrent(hash) {
    const deleteFiles = document.getElementById('deleteFilesCheckbox').checked;
    
    try {
        const response = await fetch(`${API_BASE}/torrents/${hash}?delete_files=${deleteFiles}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showNotification('Торрент удален', 'success');
            loadTorrents();
            loadStats();
        } else {
            const error = await response.json();
            showNotification(`Ошибка: ${error.error}`, 'error');
        }
    } catch (error) {
        console.error('Failed to delete torrent:', error);
        showNotification('Ошибка удаления торрента', 'error');
    }
}

// Пауза торрента
async function pauseTorrent(hash) {
    try {
        const response = await fetch(`${API_BASE}/torrents/${hash}/pause`, {
            method: 'POST'
        });
        
        if (response.ok) {
            showNotification('Торрент приостановлен', 'success');
            loadTorrents();
        } else {
            const error = await response.json();
            showNotification(`Ошибка: ${error.error}`, 'error');
        }
    } catch (error) {
        console.error('Failed to pause torrent:', error);
        showNotification('Ошибка приостановки торрента', 'error');
    }
}

// Возобновление торрента
async function resumeTorrent(hash) {
    try {
        const response = await fetch(`${API_BASE}/torrents/${hash}/resume`, {
            method: 'POST'
        });
        
        if (response.ok) {
            showNotification('Торрент возобновлен', 'success');
            loadTorrents();
        } else {
            const error = await response.json();
            showNotification(`Ошибка: ${error.error}`, 'error');
        }
    } catch (error) {
        console.error('Failed to resume torrent:', error);
        showNotification('Ошибка возобновления торрента', 'error');
    }
}

// Сохранение настроек
async function saveSettings() {
    const data = {};
    
    const maxDownloads = document.getElementById('maxDownloads').value;
    const downloadPath = document.getElementById('downloadPath').value;
    
    if (maxDownloads) data.max_concurrent_downloads = parseInt(maxDownloads);
    if (downloadPath) data.download_base_path = downloadPath;
    
    try {
        const response = await fetch(`${API_BASE}/settings`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            showNotification('Настройки сохранены', 'success');
            loadSettings();
        }
    } catch (error) {
        console.error('Failed to save settings:', error);
        showNotification('Ошибка сохранения настроек', 'error');
    }
}

// Загрузка файлов торрента
async function loadTorrentFiles(hash, name) {
    try {
        const response = await fetch(`${API_BASE}/torrents/${hash}/files`);
        const data = await response.json();
        
        currentFilesHash = hash;
        currentFiles = data.files || [];
        
        document.getElementById('modalTorrentName').textContent = name;
        
        const filesList = document.getElementById('filesList');
        filesList.innerHTML = '';
        
        if (data.message) {
            filesList.innerHTML = `<p>${data.message}</p>`;
            document.getElementById('applySelectionBtn').style.display = 'none';
            document.getElementById('selectAllFilesBtn').style.display = 'none';
            document.getElementById('deselectAllFilesBtn').style.display = 'none';
        } else {
            document.getElementById('applySelectionBtn').style.display = 'inline-block';
            document.getElementById('selectAllFilesBtn').style.display = 'inline-block';
            document.getElementById('deselectAllFilesBtn').style.display = 'inline-block';
            
            data.files.forEach(file => {
                const fileElement = document.createElement('div');
                fileElement.className = 'file-item';
                fileElement.innerHTML = `
                    <div class="file-info">
                        <input type="checkbox" class="file-checkbox" data-index="${file.index}" ${file.priority !== 0 ? 'checked' : ''}>
                        <div class="file-details">
                            <div class="file-name">${file.path}</div>
                            <div class="file-size">${formatBytes(file.size)}</div>
                            <div class="file-progress">
                                <div class="file-progress-fill" style="width: ${file.progress}%"></div>
                            </div>
                            <div class="progress-text">${file.progress.toFixed(1)}%</div>
                        </div>
                    </div>
                    <button class="download-file-btn" onclick="downloadFile('${hash}', ${file.index}, '${file.path.replace(/'/g, "\\'")}')">
                        Скачать
                    </button>
                `;
                filesList.appendChild(fileElement);
            });
        }
        
        document.getElementById('fileModal').style.display = 'block';
    } catch (error) {
        console.error('Failed to load files:', error);
        showNotification('Ошибка загрузки списка файлов', 'error');
    }
}

// Выбрать/снять все файлы
function selectAllFiles(select) {
    const checkboxes = document.querySelectorAll('#filesList .file-checkbox');
    checkboxes.forEach(cb => {
        cb.checked = select;
    });
}

// Применить выбранные файлы (установить приоритет 4 для выбранных, 0 для остальных)
async function applyFileSelection() {
    if (!currentFilesHash || !currentFiles.length) return;
    
    const checkboxes = document.querySelectorAll('#filesList .file-checkbox');
    const selectedIndices = [];
    checkboxes.forEach(cb => {
        if (cb.checked) {
            selectedIndices.push(parseInt(cb.dataset.index));
        }
    });
    
    // Строим объект приоритетов: для выбранных 4, для остальных 0
    const priorities = {};
    currentFiles.forEach(file => {
        priorities[file.index] = selectedIndices.includes(file.index) ? 4 : 0;
    });
    
    try {
        const response = await fetch(`${API_BASE}/torrents/${currentFilesHash}/files/priorities`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ priorities })
        });
        
        if (response.ok) {
            showNotification('Приоритеты файлов обновлены', 'success');
            // Обновляем список файлов
            loadTorrentFiles(currentFilesHash, document.getElementById('modalTorrentName').textContent);
        } else {
            const error = await response.json();
            showNotification(`Ошибка: ${error.error}`, 'error');
        }
    } catch (error) {
        console.error('Failed to apply file selection:', error);
        showNotification('Ошибка применения выбора', 'error');
    }
}

// Загрузка деталей торрента
async function loadTorrentDetails(hash) {
    try {
        const response = await fetch(`${API_BASE}/torrents/${hash}`);
        const torrent = await response.json();
        
        const details = document.getElementById('torrentDetails');
        details.innerHTML = `
            <div class="torrent-details">
                <div class="detail-row">
                    <span class="detail-label">Имя:</span>
                    <span class="detail-value">${torrent.name}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Хеш:</span>
                    <span class="detail-value">${torrent.info_hash}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Magnet:</span>
                    <span class="detail-value magnet">${torrent.magnet_link}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Путь:</span>
                    <span class="detail-value">${torrent.save_path}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Статус:</span>
                    <span class="detail-value">${torrent.status}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Прогресс:</span>
                    <span class="detail-value">${torrent.progress.toFixed(1)}%</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Размер:</span>
                    <span class="detail-value">${formatBytes(torrent.total_size)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Скачано:</span>
                    <span class="detail-value">${formatBytes(torrent.downloaded_size)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Скорость загрузки:</span>
                    <span class="detail-value">${formatBytes(torrent.download_rate)}/с</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Скорость отдачи:</span>
                    <span class="detail-value">${formatBytes(torrent.upload_rate)}/с</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Пиры:</span>
                    <span class="detail-value">${torrent.num_peers}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Сиды:</span>
                    <span class="detail-value">${torrent.num_seeds}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Добавлен:</span>
                    <span class="detail-value">${new Date(torrent.added_time).toLocaleString()}</span>
                </div>
                ${torrent.error_message ? `
                <div class="detail-row">
                    <span class="detail-label">Ошибка:</span>
                    <span class="detail-value" style="color: #f56565;">${torrent.error_message}</span>
                </div>
                ` : ''}
            </div>
        `;
        
        document.getElementById('torrentModal').style.display = 'block';
    } catch (error) {
        console.error('Failed to load torrent details:', error);
        showNotification('Ошибка загрузки деталей торрента', 'error');
    }
}

// Скачивание файла
function downloadFile(hash, index, filename) {
    window.location.href = `${API_BASE}/torrents/${hash}/files/${index}`;
}

// ==================== Файловый проводник ====================

// Открыть проводник
function openFileManager() {
    loadFileManagerList('');
    document.getElementById('fileManagerModal').style.display = 'block';
}

// Загрузить содержимое папки
async function loadFileManagerList(path) {
    currentFileManagerPath = path;
    
    const listElement = document.getElementById('fileManagerList');
    const pathElement = document.getElementById('fileManagerPath');
    const statusElement = document.getElementById('fileManagerStatus');
    
    listElement.innerHTML = '<div class="loading">Загрузка...</div>';
    statusElement.innerHTML = '';
    
    try {
        const url = path ? `${API_BASE}/filesystem/list?path=${encodeURIComponent(path)}` : `${API_BASE}/filesystem/list`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.error) {
            listElement.innerHTML = `<div class="error">Ошибка: ${data.error}</div>`;
            return;
        }
        
        pathElement.textContent = `Текущий путь: /${data.path || '(корень)'}`;
        
        if (data.type === 'file') {
            // Показываем информацию о файле (обычно не должно быть)
            listElement.innerHTML = `
                <div class="file-item">
                    <div class="file-info">
                        <span class="material-icons">insert_drive_file</span>
                        <span class="file-name">${data.name}</span>
                        <span class="file-size">${formatBytes(data.size)}</span>
                    </div>
                </div>
            `;
        } else {
            if (!data.items || data.items.length === 0) {
                listElement.innerHTML = '<div class="empty">Папка пуста</div>';
                return;
            }
            
            let html = '';
            
            data.items.forEach(item => {
                if (item.type === 'dir') {
                    html += `
                        <div class="file-item" data-path="${item.path}" data-type="dir">
                            <div class="file-info" onclick="navigateToFileManagerDir('${item.path}')">
                                <span class="material-icons">folder</span>
                                <span class="file-name">${item.name}</span>
                            </div>
                            <div class="file-actions">
                                <button class="btn-icon" onclick="showDeleteFileConfirm('${item.path}', 'dir')" title="Удалить папку">
                                    <span class="material-icons">delete</span>
                                </button>
                            </div>
                        </div>
                    `;
                } else {
                    const modifiedDate = new Date(item.modified * 1000).toLocaleString();
                    html += `
                        <div class="file-item" data-path="${item.path}" data-type="file">
                            <div class="file-info">
                                <span class="material-icons">insert_drive_file</span>
                                <span class="file-name">${item.name}</span>
                                <span class="file-size">${formatBytes(item.size)}</span>
                                <span class="file-modified">${modifiedDate}</span>
                            </div>
                            <div class="file-actions">
                                <button class="btn-icon" onclick="downloadFileManagerItem('${item.path}')" title="Скачать">
                                    <span class="material-icons">download</span>
                                </button>
                                <button class="btn-icon" onclick="showDeleteFileConfirm('${item.path}', 'file')" title="Удалить файл">
                                    <span class="material-icons">delete</span>
                                </button>
                            </div>
                        </div>
                    `;
                }
            });
            
            listElement.innerHTML = html;
        }
    } catch (error) {
        console.error('Failed to load file list:', error);
        listElement.innerHTML = '<div class="error">Ошибка загрузки</div>';
        showNotification('Ошибка загрузки списка файлов', 'error');
    }
}

// Навигация в папку
function navigateToFileManagerDir(path) {
    loadFileManagerList(path);
}

// Навигация вверх
function navigateFileManagerUp() {
    if (!currentFileManagerPath) return; // Уже в корне
    
    const parentPath = currentFileManagerPath.split('/').slice(0, -1).join('/');
    loadFileManagerList(parentPath);
}

// Скачивание файла из проводника
function downloadFileManagerItem(filePath) {
    // Для скачивания используем обычную ссылку, но нужно определить правильный endpoint
    // Пока открываем в новом окне (если сервер не настроен на прямую отдачу)
    window.open(`${API_BASE}/filesystem/download?path=${encodeURIComponent(filePath)}`, '_blank');
}

// Показать подтверждение удаления
function showDeleteFileConfirm(path, type) {
    pendingDeletePath = path;
    pendingDeleteType = type;
    
    const message = type === 'dir' ? 
        `Удалить папку "${path}" и всё её содержимое?` : 
        `Удалить файл "${path}"?`;
    
    document.getElementById('confirmDeleteFileMessage').textContent = message;
    document.getElementById('confirmDeleteFileModal').style.display = 'block';
}

// Закрыть модальное окно подтверждения
function closeConfirmDeleteFileModal() {
    document.getElementById('confirmDeleteFileModal').style.display = 'none';
    pendingDeletePath = null;
    pendingDeleteType = null;
}

// Удаление элемента
async function deleteFileManagerItem(itemPath, type) {
    try {
        const response = await fetch(`${API_BASE}/filesystem/delete?path=${encodeURIComponent(itemPath)}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification(`${type === 'dir' ? 'Папка' : 'Файл'} удален`, 'success');
            // Обновляем текущую папку
            loadFileManagerList(currentFileManagerPath);
        } else {
            showNotification(data.error || 'Ошибка удаления', 'error');
        }
    } catch (error) {
        console.error('Failed to delete item:', error);
        showNotification('Ошибка удаления', 'error');
    }
}

// Форматирование байтов
function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 B';
    if (!bytes) return '0 B';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Форматирование времени
function formatTime(seconds) {
    if (!seconds) return '0с';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    const parts = [];
    if (hours > 0) parts.push(hours + 'ч');
    if (minutes > 0) parts.push(minutes + 'м');
    if (secs > 0 || parts.length === 0) parts.push(secs + 'с');
    
    return parts.join(' ');
}

// Показать уведомление
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Отрисовка статистики
function renderStats() {
    if (!currentStats) return;
    
    const container = document.getElementById('statsContainer');
    container.innerHTML = `
        <div class="stat-card">
            <h3>Всего торрентов</h3>
            <div class="stat-value">${currentStats.total_torrents}</div>
        </div>
        <div class="stat-card">
            <h3>Активные</h3>
            <div class="stat-value">${currentStats.active_torrents}</div>
        </div>
        <div class="stat-card">
            <h3>Завершено</h3>
            <div class="stat-value">${currentStats.completed_torrents}</div>
        </div>
        <div class="stat-card">
            <h3>В очереди</h3>
            <div class="stat-value">${currentStats.waiting_torrents}</div>
        </div>
        <div class="stat-card">
            <h3>Ошибки</h3>
            <div class="stat-value">${currentStats.error_torrents}</div>
        </div>
        <div class="stat-card speed">
            <h3>Загрузка</h3>
            <div class="stat-value">${formatBytes(currentStats.total_download_rate)}<span class="stat-unit">/с</span></div>
        </div>
        <div class="stat-card speed">
            <h3>Отдача</h3>
            <div class="stat-value">${formatBytes(currentStats.total_upload_rate)}<span class="stat-unit">/с</span></div>
        </div>
    `;
}

// Отрисовка списка торрентов
function renderTorrents() {
    const container = document.getElementById('torrentsList');
    
    if (currentTorrents.length === 0) {
        container.innerHTML = '<div class="loading">Торренты не найдены</div>';
        return;
    }
    
    container.innerHTML = currentTorrents.map(torrent => `
        <div class="torrent-item">
            <div class="torrent-header">
                <div>
                    <span class="torrent-name">${torrent.name}</span>
                    <span class="torrent-hash">${torrent.info_hash.substring(0, 16)}...</span>
                </div>
                <span class="torrent-status status-${torrent.status}">${torrent.status}</span>
            </div>
            
            <div class="torrent-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${torrent.progress}%"></div>
                </div>
                <div class="progress-text">${torrent.progress.toFixed(1)}%</div>
            </div>
            
            <div class="torrent-stats">
                <div class="stat-item">
                    <span class="stat-label">Размер</span>
                    <span class="stat-value">${formatBytes(torrent.total_size)}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Скорость ↓</span>
                    <span class="stat-value">${formatBytes(torrent.download_rate)}/с</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Скорость ↑</span>
                    <span class="stat-value">${formatBytes(torrent.upload_rate)}/с</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Пиры</span>
                    <span class="stat-value">${torrent.num_peers}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Сиды</span>
                    <span class="stat-value">${torrent.num_seeds}</span>
                </div>
                ${torrent.seed_time_remaining ? `
                <div class="stat-item">
                    <span class="stat-label">Раздача осталось</span>
                    <span class="stat-value">${formatTime(torrent.seed_time_remaining)}</span>
                </div>
                ` : ''}
            </div>
            
            <div class="torrent-actions">
                <button onclick="loadTorrentFiles('${torrent.info_hash}', '${torrent.name.replace(/'/g, "\\'")}')">
                    <span class="material-icons">folder</span>
                    Файлы
                </button>
                <button onclick="loadTorrentDetails('${torrent.info_hash}')">
                    <span class="material-icons">info</span>
                    Детали
                </button>
                ${torrent.status === 'paused' ? `
                <button class="btn-secondary" onclick="resumeTorrent('${torrent.info_hash}')">
                    <span class="material-icons">play_arrow</span>
                    Возобновить
                </button>
                ` : torrent.status !== 'completed' && torrent.status !== 'error' ? `
                <button class="btn-warning" onclick="pauseTorrent('${torrent.info_hash}')">
                    <span class="material-icons">pause</span>
                    Пауза
                </button>
                ` : ''}
                <button class="btn-danger" onclick="showDeleteModal('${torrent.info_hash}')">
                    <span class="material-icons">delete</span>
                    Удалить
                </button>
            </div>
        </div>
    `).join('');
}

// Отрисовка пагинации
function renderPagination() {
    const container = document.getElementById('pagination');
    const totalPages = Math.ceil(totalTorrents / currentLimit);
    const currentPage = Math.floor(currentOffset / currentLimit) + 1;
    
    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }
    
    let html = '';
    
    // Кнопка "Предыдущая"
    html += `<button onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>←</button>`;
    
    // Номера страниц
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
            html += `<button onclick="changePage(${i})" class="${i === currentPage ? 'active' : ''}">${i}</button>`;
        } else if (i === currentPage - 3 || i === currentPage + 3) {
            html += `<button disabled>...</button>`;
        }
    }
    
    // Кнопка "Следующая"
    html += `<button onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>→</button>`;
    
    container.innerHTML = html;
}

// Смена страницы
function changePage(page) {
    currentOffset = (page - 1) * currentLimit;
    loadTorrents();
}

// Показать модальное окно удаления
function showDeleteModal(hash) {
    currentDeleteHash = hash;
    document.getElementById('deleteModal').style.display = 'block';
}