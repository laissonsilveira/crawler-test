'use strict';

const Core = require('./core');
const TIMEOUT = 30000;
const LOGGER = require('winston');
const Screenshot = require('../util/screenshot');
const ClientHelper = require('../util/client-helper');

exports.CrawlerTest = class {

    constructor(params) {
        this.params = params;
        const core = new Core(params);
        this.driver = core.getDriver();
        this.until = core.getUntil();
        this.config = core.getConfig();
        this.By = core.getBy();
        this.promise = core.getPromise();
    }

    getElement(xpath) {
        return this.waitFor(xpath);
    }

    type(text, xpath) {
        this.getElement(xpath).sendKeys(text);
    }

    click(xpath) {
        this.getElement(xpath).click();
    }

    goTo(target) {
        this.driver.get(target);
    }

    getText(xpath) {
        return this.waitFor(xpath).then(elm => elm.getText());
    }

    waitFor(xpath) {
        return this.driver.wait(this.until.elementLocated(this.By.xpath(xpath)), TIMEOUT);
    }

    flow(callback) {
        this.promise.controlFlow().execute(callback);
    }

    quit() {
        this.driver.quit();
    }

    takeScreenshot() {
        new Screenshot(this.driver).take();
    }

    download(link) {

    }

    start() {
        const target = this.params.target;
        if (!target) {
            LOGGER.warn("Target is required!");
            return;
        }
        LOGGER.info("Initializing...");
        LOGGER.info("Target: ", target);
        this.goTo(target);
    }
};