'use strict';

if (!process.argv[2]) throw Error('Informe o nome do site!');

global.__CONFIG = require('./config-app');
const LOGGER = require('./util/logger');

const CrawlerTest = require('./src/crawlerTest'),
    Site = require('./targets/' + process.argv[2]),
    crawlerTest = new CrawlerTest(Site.URL);

crawlerTest.start();

new Site(crawlerTest).execute()
    .then(result => {
        LOGGER.info('Finished... RESULT:', JSON.stringify(result, null, 4));
        crawlerTest.quit();
    })
    .catch(err => LOGGER.error(err));



