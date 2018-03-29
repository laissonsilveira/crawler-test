(function () {
    'use strict';

    const {Builder, Capabilities, logging, By, until, promise} = require('selenium-webdriver');

    class Core {

        constructor() {
            this._driver = this.__webdriverBuilder(process.argv[3])
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
            caps.set('phantomjs.page.settings.userAgent', CONFIG.browser.userAgent);
            // caps.set('phantomjs.page.settings.encoding', 'ISO-8859-1');
            caps.set("phantomjs.page.customHeaders." + "Accept-Language", CONFIG.browser.language);
            // caps.set("phantomjs.page.customHeaders."+ "Accept", 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8');
            // caps.set("phantomjs.page.customHeaders."+ "Upgrade-Insecure-Requests", '1');
            // caps.set("phantomjs.page.customHeaders."+ "Accept-Encoding", 'gzip, deflate');
            // caps.set("phantomjs.binary.path", '/phantomjs-2.1.1');

            return new Builder().withCapabilities(caps).build();
        }

        __getChromeDriver() {
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

                if (CONFIG.browser.isHeadless) {
                    args = args.concat([
                        "--headless",
                        "--disable-gpu",
                        "--no-sandbox"
                    ]);
                }

                caps.set("chromeOptions", {args});
            }
            return new Builder().withCapabilities(caps).build();
        }

        _CONFIGLoggerHttp(level) {
            logging.installConsoleHandler();
            logging.getLogger('webdriver.http').setLevel(level);
        }

        __webdriverBuilder(browser, proxyServer, proxyAuth, cookiePath) {

            this._CONFIGLoggerHttp(logging.Level[CONFIG.logLevel]);

            browser = browser || CONFIG.browser.name || 'phantomjs';

            LOGGER.info('Browser escolhido: ' + browser);

            if (browser === 'phantomjs') {
                return this.__getPhantomDriver(proxyServer, proxyAuth, cookiePath);
            } else if (browser === 'chrome') {
                return this.__getChromeDriver();
            }
            LOGGER.error(`Navegador '${browser}' não permitido`);
        }

        get until() {
            return until;
        }

        get By() {
            return By;
        }

        get driver() {
            return this._driver;
        }

        get promise() {
            return promise;
        }
    }

    module.exports = Core;
})();