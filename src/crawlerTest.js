'use strict';

const Core = require('./core'),
    Screenshot = require('../util/screenshot'),
    TIMEOUT = 30000;

class CrawlerTest {

    constructor(URL) {
        this._URL = URL;
        this._core = new Core();
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
        this._core.driver.get(target);
    }

    getText(xpath) {
        return this.waitFor(xpath).then(elm => elm.getText());
    }

    waitFor(xpath) {
        return this._core.driver.wait(this._core.until.elementLocated(this._core.By.xpath(xpath)), TIMEOUT);
    }

    flow(callback) {
        this._core.promise.controlFlow().execute(callback);
    }

    quit() {
        this._core.driver.quit();
    }

    takeScreenshot() {
        new Screenshot(this._core.driver).take();
    }

    start() {
        const target = this._URL;
        if (!target) return LOGGER.warn("Target is required!");
        LOGGER.info(`Initializing... TARGET: ${target}`);
        this.goTo(target);
    }
}

module.exports = CrawlerTest;