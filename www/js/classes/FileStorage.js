class FileStorage {
    /**
     * @param {Object} [options]
     * @param {'auto'|'data'|'externalRoot'|'documents'} [options.base]
     * @param {string} [options.subDir] optional subdirectory (e.g. 'FanlikApps')
     */
    constructor(options) {
        this.options = Object.assign({ base: 'auto', subDir: null }, options || {});
        this.storageType = this._isCordovaActive() ? 'file' : 'localStorage';
        this._baseUrl = null; // resolved cordova base url
        console.log(`FileStorage initialized with type: ${this.storageType}`);
        if (this._isCordovaActive()) {
            // Try resolve base directory eagerly; fallback handled inside
            try { this._baseUrl = this._resolveBaseUrl(); } catch(e) { this._baseUrl = null; }
        }
    }

    _isCordovaActive() {
        try {
            return !!(window.cordova && window.cordova.file && window.cordova.file.dataDirectory);
        } catch (e) {
            return false;
        }
    }

    /**
     * Записать данные в файл
     * @param {string} fileName - имя файла (например, "config.json")
     * @param {string} text - содержимое
     * @param {boolean} isAppend - добавлять к существующему или перезаписать
     * @returns {Promise<Object>} результат операции
     */
    writeFile(fileName, text, isAppend = false) {
        return this._isCordovaActive()
            ? this._writeCordova(fileName, text, isAppend)
            : this._writeBrowser(fileName, text, isAppend);
    }

    /**
     * Прочитать содержимое файла
     * @param {string} fileName
     * @returns {Promise<{text: string, fileEntry?: any, fullPath: string, size: number}>}
     */
    readFile(fileName) {
        return this._isCordovaActive()
            ? this._readCordova(fileName)
            : this._readBrowser(fileName);
    }

    /**
     * Удалить файл
     * @param {string} fileName
     * @returns {Promise<void>}
     */
    deleteFile(fileName) {
        return this._isCordovaActive()
            ? this._deleteCordova(fileName)
            : this._deleteBrowser(fileName);
    }

    /**
     * Проверить существование файла
     * @param {string} fileName
     * @returns {Promise<boolean>}
     */
    fileExists(fileName) {
        return this._isCordovaActive()
            ? this._existsCordova(fileName)
            : this._existsBrowser(fileName);
    }

    // ==================== МЕТОДЫ ДЛЯ РАБОТЫ С КНИГАМИ (С РАСШИРЕНИЕМ .FB2) ====================
    // Используют универсальные методы, автоматически добавляя расширение .fb2

    WriteBook(id, text, isAppend = false) {
        const fileName = id + '.fb2';
        return this.writeFile(fileName, text, isAppend);
    }

    readBook(id) {
        const fileName = id + '.fb2';
        return this.readFile(fileName);
    }

    deleteBook(id) {
        const fileName = id + '.fb2';
        return this.deleteFile(fileName);
    }

    BookExists(id) {
        const fileName = id + '.fb2';
        return this.fileExists(fileName);
    }

    // ==================== ПРИВАТНЫЕ МЕТОДЫ ДЛЯ CORDOVA ====================
    // (оставлены без изменений, но теперь вызываются из универсальных методов)

    _writeCordova(fileName, text, isAppend) {
        console.log("Сохранение файла на диске:", fileName);
        return new Promise((resolve, reject) => {
            try {
                window.resolveLocalFileSystemURL(
                    cordova.file.dataDirectory,
                    (dirEntry) => {
                        const dataObj = new Blob([text], { type: 'text/plain;charset=utf-8' });
                        dirEntry.getFile(
                            fileName,
                            { create: true, exclusive: false },
                            (fileEntry) => {
                                fileEntry.createWriter((fileWriter) => {
                                    fileWriter.onwriteend = () => {
                                        fileEntry.file((file) => {
                                            if (file.size !== dataObj.size) {
                                                console.warn(`[WRITE] File size mismatch: expected ${dataObj.size}, got ${file.size}`);
                                            }
                                            resolve(fileEntry);
                                        }, () => resolve(fileEntry));
                                    };
                                    fileWriter.onerror = reject;
                                    fileWriter.onabort = () => reject(new Error('Write aborted'));

                                    if (isAppend) {
                                        fileEntry.file((file) => {
                                            fileWriter.seek(file.size);
                                            fileWriter.write(dataObj);
                                        }, () => fileWriter.write(dataObj));
                                    } else {
                                        fileWriter.write(dataObj);
                                    }
                                }, reject);
                            }, reject);
                    }, reject);
            } catch (error) {
                reject(error);
            }
        });
    }

    _readCordova(fileName) {
        console.log("Чтение файла с диска:", fileName);
        return new Promise((resolve, reject) => {
            try {
                window.resolveLocalFileSystemURL(
                    cordova.file.dataDirectory,
                    (dirEntry) => {
                        dirEntry.getFile(
                            fileName,
                            { create: false },
                            (fileEntry) => {
                                fileEntry.file((file) => {
                                    const reader = new FileReader();
                                    reader.onload = (e) => resolve({
                                        text: e.target.result,
                                        fileEntry,
                                        fullPath: fileEntry.fullPath,
                                        size: file.size
                                    });
                                    reader.onerror = (e) => reject(e.target?.error || new Error('FileReader error'));
                                    reader.readAsText(file);
                                }, reject);
                            }, reject);
                    }, reject);
            } catch (error) {
                reject(error);
            }
        });
    }

    _deleteCordova(fileName) {
        return new Promise((resolve, reject) => {
            window.resolveLocalFileSystemURL(
                cordova.file.dataDirectory,
                (dirEntry) => {
                    dirEntry.getFile(fileName, { create: false }, (fileEntry) => {
                        fileEntry.remove(resolve, reject);
                    }, reject);
                }, reject);
        });
    }

    _existsCordova(fileName) {
        return new Promise((resolve) => {
            window.resolveLocalFileSystemURL(
                cordova.file.dataDirectory,
                (dirEntry) => {
                    dirEntry.getFile(fileName, { create: false },
                        () => resolve(true),
                        () => resolve(false));
                }, () => resolve(false));
        });
    }

    // ==================== ПРИВАТНЫЕ МЕТОДЫ ДЛЯ БРАУЗЕРА ====================

    _getBrowserKey(fileName) {
        return 'file_' + fileName;
    }

    _writeBrowser(fileName, text, isAppend) {
        console.log("Запись в localStorage:", fileName);
        return new Promise((resolve, reject) => {
            try {
                const key = this._getBrowserKey(fileName);
                const existing = localStorage.getItem(key) || '';
                const newText = isAppend ? existing + text : text;

                const sizeMB = (newText.length * 2) / (1024 * 1024);
                if (sizeMB > 4) {
                    console.warn(`[WRITE] localStorage size may exceed limit (≈${sizeMB.toFixed(2)} MB).`);
                }

                localStorage.setItem(key, newText);
                resolve({
                    fullPath: fileName,
                    size: newText.length
                });
            } catch (e) {
                reject(e);
            }
        });
    }

    _readBrowser(fileName) {
        console.log("Чтение из localStorage:", fileName);
        return new Promise((resolve, reject) => {
            try {
                const key = this._getBrowserKey(fileName);
                const text = localStorage.getItem(key);
                if (text === null) {
                    reject(new Error(`File "${fileName}" not found in localStorage`));
                } else {
                    resolve({
                        text,
                        fileEntry: null,
                        fullPath: fileName,
                        size: text.length
                    });
                }
            } catch (e) {
                reject(e);
            
            }
        });
    }

    _deleteBrowser(fileName) {
        return new Promise((resolve, reject) => {
            try {
                const key = this._getBrowserKey(fileName);
                localStorage.removeItem(key);
                resolve();
            } catch (e) {
                reject(e);
            }
        });
    }

    _existsBrowser(fileName) {
        const key = this._getBrowserKey(fileName);
        return Promise.resolve(localStorage.getItem(key) !== null);
    }

    // ==================== ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ ДЛЯ ВЫБОРА БАЗОВОЙ ДИРЕКТОРИИ ====================
    _resolveBaseUrl() {
        // Если уже вычислили — вернуть
        if (this._baseUrl) return this._baseUrl;
        if (!this._isCordovaActive()) return null;
        const base = (this.options && this.options.base) || 'auto';
        const cf = cordova.file || {};
        let url = null;
        try {
            if (base === 'data') url = cf.dataDirectory;
            else if (base === 'externalRoot') url = cf.externalRootDirectory || cf.externalDataDirectory || cf.dataDirectory;
            else if (base === 'documents') url = cf.documentsDirectory || cf.dataDirectory;
            else {
                // auto: для android пробуем externalRoot, для ios — documents
                const plat = (cordova.platformId || '').toLowerCase();
                if (plat === 'android') url = cf.externalRootDirectory || cf.externalDataDirectory || cf.dataDirectory;
                else url = cf.documentsDirectory || cf.dataDirectory;
            }
        } catch (e) {
            url = null;
        }
        if (!url) url = (cordova.file && cordova.file.dataDirectory) || null;
        this._baseUrl = url;
        return url;
    }
}

