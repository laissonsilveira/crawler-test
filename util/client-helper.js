(function () {
    "use strict";

    const {By, until} = require('selenium-webdriver');
    const request = require('request');
    const textract = require('textract');
    const querystring = require('querystring');
    const LOGGER = require('winston');
    const {writeFileSync, mkdirSync, existsSync} = require('fs');
    const moment = require('moment');

    class ClientHelper {

        static downloadThroughPost(resourceURL, headers, body, redirect) {
            let formData = querystring.stringify(body);
            return new Promise((resolve, reject) => {
                let options = {
                    url: resourceURL,
                    encoding: null,
                    followRedirect: redirect,
                    headers: headers || {},
                    body: formData
                };
                request.post(options, (error, response, body) => {
                    if (error) {
                        LOGGER.error(error);
                        reject(error);
                        return;
                    }
                    resolve(body);
                });
            });
        }

        static parserPDF(pdfBuffer) {
            LOGGER.debug('Parsing PDF...');
            let config = {
                preserveLineBreaks: true
            };
            return new Promise((resolve, reject) => {
                textract.fromBufferWithMime("application/pdf", pdfBuffer, config, (error, text) => {
                    if (error) {
                        reject(error);
                    }
                    resolve(text);
                });
            });
        }

        static imgElementToBase64(seleniumDriver, elementXPath) {
            let elementToExtractImg = seleniumDriver.findElement(By.xpath(elementXPath));
            return seleniumDriver.executeScript(function () {
                    var canvas = document.createElement('canvas');
                    var imgCaptcha = arguments[0];
                    canvas.width = imgCaptcha.width;
                    canvas.height = imgCaptcha.height;
                    var ctx = canvas.getContext('2d');
                    ctx.drawImage(imgCaptcha, 0, 0);
                    var dataURL = canvas.toDataURL('image/png');
                    return dataURL;
                }, elementToExtractImg
            );
        }

        /**
         * Método para extrair texto de um elemento.
         * OBS: não usar dentro de um loop de componentes com muitos elementos
         *
         * @param jsonToPopulate
         * @param elementWhereFind
         * @param elementXPath
         * @param attribName
         * @param processResultFunc
         */
        static extractText(jsonToPopulate, elementWhereFind, elementXPath, attribName, processResultFunc) {
            let elementToExtractText;
            if (elementWhereFind.wait) {
                elementToExtractText = elementWhereFind.wait(until.elementLocated(By.xpath(elementXPath)), 1000);
            } else {
                elementToExtractText = elementWhereFind.findElement(By.xpath(elementXPath));
            }
            elementToExtractText.getText()
                .then((result) => {
                    jsonToPopulate[attribName] = processResultFunc ? processResultFunc(result) : result || null;
                })
                .catch(() => {
                    LOGGER.warn('Element with the xPath \'' + elementXPath + '\' as \'' + attribName + '\' has not been found!');
                    jsonToPopulate[attribName] = processResultFunc ? processResultFunc(null) : null;
                });
        }

        /**
         * Método para converter uma 'table' de 2 colunas para um JSON.
         * OBS: Caso não tenha valor na coluna será adicionado key: 'keyNotFound[<INDEX_LINHA>_<INDEX_COLUNHA>]'
         *
         * @param seleniumDriver {WebDriver} - Driver do Selenium
         * @param tableEl {WebElement} - Web Elemento table/tbody para converter em um Objeto
         * @param firstColumn {String} [firstColumn=key] - Nome da primeira coluna: chave do objeto
         * @param secondColumn {String} [secondColumn=value] - Nome da segunda coluna: valor do objeto
         * @returns {promise.Promise.<T>} - then object -> {key:"String", value:"String" ... keyChild: ["String", "String"] <Optional>}
         */
        static convertTableTwoColumns(seleniumDriver, tableEl, firstColumn = 'key', secondColumn = 'value') {
            return seleniumDriver.wait(() => {
                return seleniumDriver.executeScript(function () {
                    var tableEl = arguments[0];
                    var firstColumn = arguments[1];
                    var secondColumn = arguments[2];
                    var nameKeyChild = 'keyChild';
                    if (!tableEl) return [];
                    return [].reduce.call(tableEl.rows, function (res, row, index) {
                        var key = row.cells[0].textContent.slice(0, -1).trim().replace(/\s\s+/g, ' ').replace(':', '');
                        key = key ? key.toLowerCase() : 'keyNotFound[' + index + '_' + 0 + ']';
                        if (row.cells[1].childElementCount > 1) {
                            var children = row.cells[1].innerText.split('\n');
                            var obj = {};
                            obj[firstColumn] = key;
                            obj[secondColumn] = children[0].trim();
                            children.forEach(function (child, index) {
                                if (index > 0) {
                                    var valueChild = child.split(':')[1];
                                    if (valueChild) Array.isArray(obj[nameKeyChild]) ? obj[nameKeyChild].push(valueChild.trim()) : obj[nameKeyChild] = [valueChild.trim()];
                                }
                            });
                            res.push(obj);
                        } else {
                            var obj = {};
                            obj[firstColumn] = key;
                            obj[secondColumn] = row.cells[1].textContent.trim().replace(/\s\s+/g, ' ');
                            res.push(obj);
                        }
                        return res;
                    }, []);
                }, tableEl, firstColumn, secondColumn);
            }, 2000);
        }

        /**
         * Converte um elemento table em um JSON
         *
         * @param seleniumDriver {WebDriver} Driver do Selenium
         * @param tableEl {WebElement} Web Elemento table/tbody para converter em um Objeto
         * @param columns {Array} Nomes das keys do json (a ordem de input no array é importante para identificar o index da coluna)
         * @returns {ManagedPromise.<T>|promise.Promise.<T>|WebElementPromise|*}
         */
        static convertTableOnObject(seleniumDriver, tableEl, columns) {
            return seleniumDriver.wait(() => {
                return seleniumDriver.executeScript(function () {
                    var tableEl = arguments[0];
                    var columns = arguments[1] || [];
                    if (!tableEl || !tableEl.rows) return [];
                    return [].reduce.call(tableEl.rows, function (res, row) {
                        var obj = {};
                        columns.forEach(function (col, index) {
                            if (!col || !row.cells[index]) return;
                            var colValue = row.cells[index].textContent.trim().replace(/\s\s+/g, ' ');
                            obj[col] = colValue ? colValue === '-' ? null : colValue : null;
                        });
                        res.push(obj);
                        return res;
                    }, []);
                }, tableEl, columns);
            }, 2000);
        }

        /**
         * Altera o nome das chaves de um objeto
         *
         * @param obj - Objeto a ser alterado
         * @param keyToChanges - Objeto com o nome da chave existente e o novo nome da chave.Ex: {oldKey: 'Chave Antiga', newKey:'novoNomeChave'}
         * @returns {*} O mesmo objeto com as chaves alteradas
         */
        static renameObjKey(obj, keyToChanges) {
            keyToChanges.forEach(objKey => {
                obj[objKey.newKey] = obj[objKey.oldKey];
                delete obj[objKey.oldKey];
            });
        }

        /**
         * Método para montar estrutura e criar pastas no padrão do backup incremental
         * @param id - path identificador
         * @returns {string} - path completo
         */
        static makePath(id) {
            const time = new Date().getTime();
            let path = __CONFIG.persistence.root + __CONFIG.persistence.backupPath;
            ClientHelper.makeDir(path);
            path += moment(time).format('YYYY_MM_DD');
            ClientHelper.makeDir(path);
            path += '/' + 'H' + moment(time).format('HH');
            ClientHelper.makeDir(path);
            path += '/' + __CONFIG.persistence.crawler;
            ClientHelper.makeDir(path);
            path += '/' + id;
            ClientHelper.makeDir(path);
            return path.replace(__CONFIG.persistence.root, '') + '/';
        }

        /**
         * Método para criar pastas
         * @param {String} path - Caminho/Nome da pasta
         */
        static makeDir(path) {
            !existsSync(path) && mkdirSync(path);
        }

        /**
         * Método para eftuar download da imagem
         * @param {String }url - URL da imagem
         * @param {String }path - Caminho para salvar imagem
         * @returns {Promise}
         */
        static downloadImage(url, path) {
            return new Promise((resolve, reject) => {
                if (existsSync(path)) {
                    LOGGER.warn('Arquivo já existente: \'' + path + '\'');
                    resolve();
                }
                request(url, {encoding: 'binary'}, function (error, response, body) {
                    writeFileSync(path, body, 'binary', function (err) {
                        LOGGER.error('Erro ao gravar o arquivo: ', err);
                    });
                    resolve();
                });
            });
        }

        /**
         * Resolver a URL e retornar o name path da URL
         * @param {String} url - URL para resolver o name path
         * @returns {String} Name path da URL
         */
        static resolvePath(url) {
            if (!url) return '';
            let match = url.match(/^(https?\:\/\/)?(([^:\/?#]*)(?:\:([0-9]+))?)\/([^?#]*\??[^#]*|)(#.*|)$/);
            let result = match && match[5] || url;
            if (result.endsWith('/')) {
                result = result.slice(0, result.length - 1);
            }
            return result;
        }

        /**
         * Método para extrair base64 da img de dentro da string
         * @param {String} src - Texto contendo base64 da imagem
         * @returns {String} Texto base64 da imagem
         */
        static extractImgBase64(src) {
            let imgStartExpression = 'data:image';
            let imgEndExpression = ');';
            let imgBase64 = src.substring(src.indexOf(imgStartExpression));
            imgBase64 = imgBase64.substring(0, imgBase64.indexOf(imgEndExpression)).replace('"', '');
            return imgBase64;
        }

        /**
         * Método para remover todos caracteres deixando apenas os números
         * @param {String} str - Texto a ser removido os caracteres
         * @return {String} Texto com somente números
         */
        static convertStringToOnlyNumber(str) {
            if (!str) return '';
            const regexOnlyNumber = /[^\d]+/g;
            return str.replace(regexOnlyNumber, '');
        }
    }

    module.exports = ClientHelper;
})();