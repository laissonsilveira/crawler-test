'use strict';
const request = require('request');
const querystring = require('querystring');
const { writeFileSync } = require('fs');
const { join } = require('path');

class Mei {

    constructor(crawlerTest) {
        this._crawlerTest = crawlerTest;
    }

    execute() {
        return new Promise(resolve => {

            // this._crawlerTest.takeScreenshot();
            // this._crawlerTest.type('04156228916', '//input[@id="meiMB_cpf"]');
            // this._crawlerTest.type('14/08/1984', '//input[@id="meiMB_dataNascimento"]');

            this._crawlerTest.sleep(20000); //para dar tempo de quebrar o captcha

            let result = {};
            this.downloadPDF(result);

            this._crawlerTest.executeInflow(() => {
                result.site = 'MEI-Download PDF';
                resolve(result);
            });

        });
    }

    downloadPDF(result) {
        this._crawlerTest.executeInflow(() => {
            let cookie = [], viewStateValue;
            this._crawlerTest.driver.manage().getCookie('JSESSIONID')
                .then(cookieSessionID => cookie.push('JSESSIONID=' + cookieSessionID.value));

            this._crawlerTest.getElement('//*[@id="javax.faces.ViewState"]').getAttribute('value')
                .then(viewStateID => viewStateValue = viewStateID);

            this._crawlerTest.executeInflow(() => {
                const headers = {
                    'Cookie': '_skinNameCookie=mei;' + cookie,
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3380.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
                    'Accept-Encoding': 'gzip, deflate',
                    'Accept-Language': 'en-US,en;q=0.9,pt-BR;q=0.8,pt;q=0.7'
                };
                const body = {
                    'j_id6': 'j_id6',
                    'uniqueToken': '',
                    'j_id6:downloadBtn': 'FAZER DOWNLOAD DO CERTIFICADO EM PDF',
                    'javax.faces.ViewState': viewStateValue
                };

                console.log('HEADER >>>>>>>', headers);
                console.log('\n');
                console.log('BODY >>>>>>>', body);
                console.log('\n');
                console.log('COOKIE >>>>>>>', cookie);

                this._crawlerTest.driver.controlFlow().wait(this.downloadThroughPost(Mei.URL,headers, body, false, false))
                    .then(pdfBuffer => writeFileSync(join(__dirname, '..', 'download', 'certificado.pdf'), pdfBuffer, 'binary'))
                    .catch(err => console.error(err));
            });
        });
    }

    downloadThroughPost(resourceURL, headers, body, redirect, isRejectUnauthorized = true) {
        let formData = querystring.stringify(body);
        return new Promise((resolve, reject) => {
            let options = {
                url: resourceURL,
                encoding: null,
                followRedirect: redirect,
                headers: headers || {},
                body: formData,
                rejectUnauthorized: isRejectUnauthorized
            };
            request.post(options, (error, response, body) => {
                if (error) reject(error);
                resolve(body);
            });
        });
    }

    static get URL() {
        return 'https://www22.receita.fazenda.gov.br/inscricaomei/private/pages/certificado_acesso.jsf';
    }

}

module.exports = Mei;




