(function () {
    'use strict';

    const {Builder, Capabilities, logging, By, until, promise} = require('selenium-webdriver');
    const config = require('../config-app.json');

    class Core {

        constructor(params) {
            this.params = params;
            this.configure();
        }

        configure() {

            logging.installConsoleHandler();
            logging.getLogger('webdriver.http').setLevel(logging.Level.ALL);

            const builder = new Builder();
            // this.configureChrome(builder);
            this.configurePhantom(builder);
            this.driver = builder.build();
        }

        configureChrome(builder) {

            let defaultArgs = config.browser.args;

            if (config.browser.ignoreArgs) {
                defaultArgs = [];
            }

            if (this.params.args) {
                defaultArgs = defaultArgs.concat(this.params.args)
            }

            const chromeCapabilities = Capabilities.chrome();
            // chromeCapabilities.set('chromeOptions', {"args": defaultArgs});
            builder.withCapabilities(chromeCapabilities);

        }

        configurePhantom(builder) {

            const caps = Capabilities.phantomjs();
            caps.set('phantomjs.cli.args', [
                "--ssl-protocol=any",
                "--ignore-ssl-errors=true",
                "--web-security=false",
                "--remote-debugger-port=9000",
                "--remote-debugger-autorun=yes",
                // "--disk-cache=true",
                // "--max-disk-cache-size=10000",
                // "--disk-cache-path=cache",
                // "--proxy-type=none"
            ]);
            // caps.set('phantomjs.page.settings.userAgent', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36');
            // caps.set("phantomjs.page.customHeaders."+ "Accept", 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8');
            // caps.set("phantomjs.page.customHeaders."+ "Accept-Language", 'pt-BR');
            // caps.set("phantomjs.page.customHeaders."+ "Upgrade-Insecure-Requests", '1');
            // caps.set("phantomjs.page.customHeaders."+ "Accept-Encoding", 'gzip, deflate');
            // caps.set("phantomjs.page.customHeaders."+ "Accept-Language", 'en-US,en;q=0.8,pt-BR;q=0.6,pt;q=0.4');
            builder.withCapabilities(caps);

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
            return config;
        }

        getPromise() {
            return promise;
        }
    }

    module.exports = Core;
})();