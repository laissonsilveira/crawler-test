'use strict';
global.__CONFIG = require('./config-app');
const LOGGER = require('./utils/logger');

module.exports = {
    init: function (target) {
        const CrawlerTest = require('./src/crawlerTest');
        const Site = require(`./targets/${target}`);
        const crawlerTest = new CrawlerTest(Site.URL);
        return new Promise(resolve => {
            crawlerTest.start();
            new Site(crawlerTest).execute().then(result => {
                LOGGER.debug('Finished... RESULT:', JSON.stringify(result, null, 4));
                crawlerTest.quit();
                resolve(result);
            }).catch(err => {
                crawlerTest.takeScreenshot();
                throw err;
            });
        })
    }
};