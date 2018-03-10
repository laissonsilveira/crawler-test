'use strict';

if (!process.argv[2]) throw Error('Informe o nome do site!');
const {CrawlerTest} = require('./src/crawlerTest');
const {target} = require('./targets/' + process.argv[2]);
const LOGGER = require('winston');

const crawlerTest = new CrawlerTest({
    target: target.url
});

target.execute(crawlerTest, result => {
    LOGGER.info('RESULT:', JSON.stringify(result));
});



