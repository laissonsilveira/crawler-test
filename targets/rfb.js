'use strict';

const path = require('path');
const target = {
    url: path.join(__dirname, '../sites/TestAcento.html'),
    execute: (crawlerTest, sendResult) => {
        let result = {
            url: target.url
        };

        crawlerTest.start();

        crawlerTest.takeScreenshot();

        crawlerTest.getText('/html/body/table[3]/tbody/tr[2]/td/b/font').then(version => {
            result.data = version;
        });

        crawlerTest.flow(() => {
            sendResult(result);
        });
    }
};

exports.target = target;




