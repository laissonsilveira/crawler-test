'use strict';

const target = {
    url: "http://admin.simplifyzone.com.br/app/#!/login",
    execute: (crawlerTest, sendResult) => {
        let result = {
            url: target.url
        };

        crawlerTest.start();

        crawlerTest.takeScreenshot();

        crawlerTest.getText('//div[contains(@class,"text-simplify")]/small').then(version => {
            result.version = version;
        });

        crawlerTest.flow(() => {
            sendResult(result);
        });
    }
};

exports.target = target;




