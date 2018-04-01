(function () {
    'use strict';

    const { Builder, Capabilities, logging } = require('selenium-webdriver');

    class Core {

        constructor() {
            this._driver = Core._webdriverBuilder(process.argv[3])
        }

        static _getPhantomDriver() {
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
            caps.set('phantomjs.page.settings.userAgent', CONFIG.browser.userAgent);
            // caps.set('phantomjs.page.settings.encoding', 'ISO-8859-1');
            caps.set("phantomjs.page.customHeaders." + "Accept-Language", CONFIG.browser.language);
            // caps.set("phantomjs.page.customHeaders."+ "Accept", 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8');
            // caps.set("phantomjs.page.customHeaders."+ "Upgrade-Insecure-Requests", '1');
            // caps.set("phantomjs.page.customHeaders."+ "Accept-Encoding", 'gzip, deflate');
            // caps.set("phantomjs.binary.path", '/phantomjs-2.1.1');

            return new Builder().withCapabilities(caps).build();
        }

        static _getChromeDriver() {
            let caps = Capabilities.chrome();
            if (!CONFIG.browser.ignoreArgs) {
                let args = [
                    // "--start-maximized",
                    // "--hide-scrollbars",
                    '--user-data-dir=crawler-test/userdata',
                    "--ignore-certificate-errors",
                    "--allow-running-insecure-content",
                    "--disable-notifications",
                    "--disable-infobars",
                    "user-agent=" + CONFIG.browser.userAgent,
                    "--lang=" + CONFIG.browser.language
                ];

                let isHeadless = CONFIG.browser.isHeadless;
                if (process.argv[4]) {
                    isHeadless = process.argv[4] === 'true';
                }

                if (isHeadless) {
                    args = args.concat([
                        "--headless",
                        "--disable-gpu",
                        "--no-sandbox"
                    ]);
                }

                caps.set("chromeOptions", { args });
            }
            return new Builder().withCapabilities(caps).build();
        }

        static _webdriverBuilder(browser, proxyServer, proxyAuth, cookiePath) {

            logging.installConsoleHandler();
            logging.getLogger('webdriver.http').setLevel(logging.Level[CONFIG.logLevel]);

            browser = browser || CONFIG.browser.name || 'phantomjs';

            LOGGER.info('Browser escolhido: ' + browser);

            if (browser === 'phantomjs') {
                return Core._getPhantomDriver(proxyServer, proxyAuth, cookiePath);
            } else if (browser === 'chrome') {
                return Core._getChromeDriver();
            }
            LOGGER.error(`Navegador '${browser}' não permitido`);
        }

        get driver() {
            return this._driver;
        }

    }

    module.exports = Core;
})();