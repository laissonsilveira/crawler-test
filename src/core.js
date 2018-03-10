(function () {
    'use strict';

    const {Builder, Capabilities, logging, By, until, promise} = require('selenium-webdriver');
    const _CONFIG = require('../config-app.json');
    const LOGGER = require('winston');
    const path = require('path');

    class Core {

        constructor(params) {
            this.params = params;
            this.driver = this.__webdriverBuilder(process.argv[3])
        }

        __getPhantomDriver() {
            let caps = Capabilities.phantomjs();
            let args = [
                '--ssl-protocol=any',
                '--ignore-ssl-errors=true',
                '--web-security=false',
                // '--disk-cache=false',
                // '--disk-cache-path=cache',
                '--remote-debugger-port=8000',
                '--remote-debugger-autorun=yes'
                // '--load-plugins=true'
            ];

            // proxyServer && args.push('--proxy=' + proxyServer);
            // proxyAuth && args.push('--proxy-auth=' + proxyAuth);

            caps.set("phantomjs.cli.args", args);
            caps.set('phantomjs.page.settings.userAgent', _CONFIG.browser.userAgent);
            // caps.set('phantomjs.page.settings.encoding', 'ISO-8859-1');
            caps.set("phantomjs.page.customHeaders." + "Accept-Language", _CONFIG.browser.language);
            // caps.set("phantomjs.page.customHeaders."+ "Accept", 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8');
            // caps.set("phantomjs.page.customHeaders."+ "Upgrade-Insecure-Requests", '1');
            // caps.set("phantomjs.page.customHeaders."+ "Accept-Encoding", 'gzip, deflate');
            // caps.set("phantomjs.binary.path", '/digitro/ambiente/workspaces/workspaceDefault/crawler/crawler-collector/src/3rd/phantomjs-2.1.1');

            return new Builder().withCapabilities(caps).build();
        }

        __getChromeDriver() {
            let caps = Capabilities.chrome();
            if (!_CONFIG.browser.ignoreArgs) {
                caps.set("chromeOptions", {
                    args: [
                        "--start-maximized",
                        "--hide-scrollbars",
                        // "--headless",
                        // "--disable-gpu",
                        // '--user-data-dir=/digitro/ambiente/workspaces/workspaceDefault/crawler-test/userdata',
                        // "--ignore-certificate-errors",
                        // "--allow-running-insecure-content",
                        "--disable-notifications",
                        "--disable-infobars",
                        "--user-agent=" + _CONFIG.browser.userAgent,
                        "--lang=" + _CONFIG.browser.language
                    ]
                });
            }
            return new Builder().withCapabilities(caps).build();
        }

        __configLoggerHttp(level) {
            logging.installConsoleHandler();
            logging.getLogger('webdriver.http').setLevel(level);
        }

        __webdriverBuilder(browser, proxyServer, proxyAuth, cookiePath) {

            this.__configLoggerHttp(logging.Level[_CONFIG.logLevel]);

            browser = browser || _CONFIG.browser.name || 'phantomjs';

            LOGGER.info('Browser escolhido: ' + browser);

            if (browser === 'phantom') {
                return this.__getPhantomDriver(proxyServer, proxyAuth, cookiePath);
            } else if (browser === 'chrome') {
                return this.__getChromeDriver();
            }
            LOGGER.error('Navegador \''+ browser + '\' não permitido');
        }

        getUntil() {
            return until;
        }

        getBy() {
            return By;
        }

        getDriver() {
            return this.driver;
        }

        getConfig() {
            return _CONFIG;
        }

        getPromise() {
            return promise;
        }
    }

    module.exports = Core;
})();