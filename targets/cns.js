'use strict';

const target = {
    url: "https://cadastro.saude.gov.br/cadsusweb/login.jsp",
    execute: (crawlerTest, sendResult) => {
        let result = {
            url: target.url
        };

        crawlerTest.start();

        // crawlerTest.takeScreenshot();

        crawlerTest.getText('//*[@id="dialog-message_sistema_fora"]/div/p[1]').then(version => {
            result.data = version;
        });

        crawlerTest.flow(() => {
            sendResult(result);
        });
    }
};

exports.target = target;




