'use strict';

const {Core} = require('./core');
const TIMEOUT = 30000;
const LOGGER = require('winston');
const Screenshot = require('../util/screenshot');

exports.CrawlerTest = class {

    constructor(params) {
        this.params = params;
        const core = new Core(params);
        this.driver = core.getDriver();
        this.webdriver = core.getWebdriver();
        this.config = core.getConfig();
        this.By = this.webdriver.By;
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
        return this.driver.wait(this.until().elementLocated(this.By.xpath(xpath)), TIMEOUT);
    }

    until() {
        return this.webdriver.until;
    }

    flow(callback) {
        this.webdriver.promise.controlFlow().execute(callback);
    }

    quit() {
        this.driver.quit();
    }

    takeScreenshot() {
        new Screenshot(this.driver).take();
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