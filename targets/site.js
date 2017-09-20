'use strict';

const target = {
    url: "http://ceat.trt15.jus.br/ceat/certidaoAction.seam",
    execute: (crawlerTest, sendResult) => {
        let result = {
            url: target.url
        };

        crawlerTest.start();

        crawlerTest.takeScreenshot();

        crawlerTest.getText('//div[@class="dr-pnl-h rich-panel-header "]').then(title => {
            result.data = title;
        });

        crawlerTest.flow(() => {
            sendResult(result);
        });
    }
};

exports.target = target;




