'use strict';

const webdriver = require('selenium-webdriver');
const config = require('../config-app.json');

exports.Core = class {

    constructor(params) {
        this.params = params;
        this.configure();
    }

    configure() {
        const builder = new webdriver.Builder();
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

        const chromeCapabilities = webdriver.Capabilities.chrome();
        // chromeCapabilities.set('chromeOptions', {"args": defaultArgs});
        builder.withCapabilities(chromeCapabilities);

    }

    configurePhantom(builder) {

        const caps = webdriver.Capabilities.phantomjs();
        caps.set('phantomjs.cli.args', [
            "--ssl-protocol=any",
            "--ignore-ssl-errors=true",
            "--web-security=false",
            "--remote-debugger-port=9000",
            "--remote-debugger-autorun=yes"
        ]);
        // caps.set('phantomjs.page.settings.userAgent', __CONFIG.browser_userAgent);
        // caps.set("phantomjs.page.customHeaders."+ "Accept-Language", __CONFIG.browser_language);
        builder.withCapabilities(caps);

    }

    getWebdriver() {
        return webdriver;
    }

    getDriver() {
        return this.driver;
    }

    getConfig() {
        return config;
    }
};