'use strict';

const Core = require('./core'),
    Screenshot = require('../util/screenshot'),
    LOGGER = require('../util/logger'),
    { until, By } = require('selenium-webdriver'),
    TIMEOUT = 30000;

class CrawlerTest {

    constructor(URL) {
        this._URL = URL;
        this._driver = new Core().driver;
    }

    sleep(timeout = 5000) {
        this._driver.sleep(timeout);
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
        this._driver.get(target);
    }

    getText(xpath) {
        return this.waitFor(xpath).then(elm => elm.getText());
    }

    waitFor(xpath) {
        return this._driver.wait(until.elementLocated(By.xpath(xpath)), TIMEOUT);
    }

    executeInflow(callback) {
        return this._driver.controlFlow().execute(callback);
    }

    quit() {
        this._driver.quit();
    }

    get driver() {
        return this._driver;
    }

    takeScreenshot() {
        new Screenshot(this._driver).take();
    }

    start() {
        const target = this._URL;
        if (!target) return LOGGER.warn("Target is required!");
        LOGGER.info(`Initializing... TARGET: ${target}`);
        this.goTo(target);
    }

}

module.exports = CrawlerTest;