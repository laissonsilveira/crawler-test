'use strict';

const {CrawlerTest} = require('./src/crawlerTest');
const {target} = require('./targets/site');
const LOGGER = require('winston');
const crawlerTest = new CrawlerTest({
    target: target.url
});

target.execute(crawlerTest, (result) => {
    LOGGER.info('RESULT:', JSON.stringify(result));
});



