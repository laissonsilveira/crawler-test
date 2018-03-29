'use strict';

class Simplify {

    constructor(crawlerTest) {
        this._crawlerTest = crawlerTest;
    }

    execute() {
        return new Promise(resolve => {

            // this._crawlerTest.takeScreenshot();

            let result = {site:'Simplify'};
            this._crawlerTest.getText('//div[contains(@class,"text-simplify")]/small').then(version => {
                result.version = version.replace(/[^\d.]+/g, '');
            });

            this._crawlerTest.executeInflow(() => {
                resolve(result);
            });

        });
    }

    static get URL() {
        return 'http://admin.simplifyzone.com.br/app/#!/login';
    }

}

module.exports = Simplify;




