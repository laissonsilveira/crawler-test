'use strict';

if (!process.argv[2]) throw Error('Informe o nome do site!');

global.CONFIG = require('./config-app')
global.LOGGER = require('./util/logger').winston;

const CrawlerTest = require('./src/crawlerTest'),
    Site = require('./targets/' + process.argv[2]),
    crawlerTest = new CrawlerTest(Site.URL);

crawlerTest.start();

new Site(crawlerTest).execute().then(result => {
    LOGGER.info('RESULT:\n', JSON.stringify(result, null, 4));
    crawlerTest.quit();
});



