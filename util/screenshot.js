(function () {
    "use strict";
    const fs = require('fs'),
        path = require('path'),
        moment = require('moment'),
        LOGGER = require('winston'),
        CONFIG = require('../config-app.json');

    class Screenshot {
        /**
         * @param {Webdriver} driver
         */
        constructor(driver) {
            this.driver = driver;
            this._CONFIG = CONFIG.screenshot;
            this._PATH = path.join(__dirname, '..', this._CONFIG.path);
            this._deleteOldScreenshots();
            this._makeScreenshotFolder();
        }

        /**
         * @returns {string}
         * @private
         */
        _getUserHome() {
            const userPath = process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'];
            if (this._CONFIG.path && this._CONFIG.path.indexOf(userPath) > -1) return '';
            return userPath;
        };

        /**
         * @private
         */
        _deleteOldScreenshots() {
            if (fs.existsSync(this._PATH)) {
                LOGGER.debug('[SCREENSHOT] - Removendo screenshots antigos...');
                fs.readdir(this._PATH, (err, files) => {
                    if (err) return LOGGER.warn('[SCREENSHOT] - Não foi possível ler o diretório (' + this._PATH + '):' , err);
                    files.forEach(file => {
                        let filePath = path.join(this._PATH, file);
                        fs.stat(filePath, (err, stat) => {
                            if (err) return LOGGER.warn('[SCREENSHOT] - Não foi possível recuperar data dos screenshots antigos a serem deletados:', err);
                            if (moment() > moment(stat.ctime).add(this._CONFIG.timeToDelete.amount, this._CONFIG.timeToDelete.time)) {
                                fs.unlink(filePath, err => {
                                    if (err) LOGGER.warn('[SCREENSHOT] - Não foi possível remover screenshots antigos:', err);
                                });
                            }
                        });
                    });
                });
            }
        };

        /**
         * @private
         */
        _makeScreenshotFolder() {
            if (!fs.existsSync(this._PATH)) {
                LOGGER.debug('[SCREENSHOT] - Criando pasta para guardar imagens de erro...');
                let sep = '/', current = '', i = 0,
                    segments = this._PATH.split(sep);
                while (i < segments.length) {
                    current = current + sep + segments[i];
                    if (!fs.existsSync(current)) {
                        try {
                            fs.mkdirSync(current);
                            LOGGER.info('[SCREENSHOT] - Diretório \'' + current + '\' criado com sucesso!')
                        } catch (e) {
                            LOGGER.warn('[SCREENSHOT] - Não foi possível criar diretório \''+ current +'\' para salvar screenshot do erro:', e.message);
                            i = segments.length;
                        }
                    }
                    i++;
                }
            }
        };

        /**
         * Salva imagem no caminho configurado em <code>basic-config.json: screenshot.path</code>
         * OBS: Caso não tenha sido informado ainda o caminho completo da pasta do usuário na config, a pasta informada
         * será concatenada com a pasta do usuário que está executando o serviço do crawler.
         */
        take() {
            this.driver.executeScript(function() {
                var style = document.createElement('style'),
                    text = document.createTextNode('body { background: #fff }');
                style.setAttribute('type', 'text/css');
                style.appendChild(text);
                document.head.insertBefore(style, document.head.firstChild);
            });

            let fileName = moment().format('YYYY-MM-DD_HH-mm-ss') + '.png';
            let filePath = path.join(this._PATH, fileName);
            this.driver.takeScreenshot().then(image => fs.writeFile(filePath, image, 'base64', err => {
                if (err) return LOGGER.warn('[SCREENSHOT] - Não foi possível salvar screenshot:', err.message);
                LOGGER.info('[SCREENSHOT] - Screenshot salvo em \''+ filePath + '\'');
            }));
        };
    }

    module.exports = Screenshot;
})();