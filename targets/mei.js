'use strict';
const request = require('request');
const querystring = require('querystring');
const { writeFileSync } = require('fs');
const { join } = require('path');

class Mei {

    /**
     *
     * @param {CrawlerTest} crawlerTest
     */
    constructor(crawlerTest) {
        this._crawler = crawlerTest;
    }

    execute() {
        return new Promise(resolve => {

            this._crawler.type('04156228916', '//input[@id="meiMB_cpf"]');
            this._crawler.type('14/08/1984', '//input[@id="meiMB_dataNascimento"]');

            this._crawler.sleep(15000); //para dar tempo de quebrar o captcha

            this._crawler.click('//input[@id="form:btnContinuar"]');

            this._crawler.waitFor('//*[@id="j_id6:downloadBtn"]');

            let result = {};
            this.downloadPDF(result).then(() => {
                result.site = 'MEI-Download PDF';
                resolve(result);
            });

        });
    }

    downloadPDF(result) {
        return this._crawler.executeInflow(() => {
            let cookie = [], viewStateValue;
            this._crawler.driver.manage().getCookie('JSESSIONID')
                .then(cookieSessionID => cookie.push('JSESSIONID=' + cookieSessionID.value));

            this._crawler.getElement('//*[@id="javax.faces.ViewState"]').getAttribute('value')
                .then(viewStateID => viewStateValue = viewStateID);

            this._crawler.executeInflow(() => {
                const headers = {
                    'Cookie': '_skinNameCookie=mei',
                    'Content-Type': 'application/x-www-form-urlencoded',
                    // 'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3380.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
                    'Accept-Encoding': 'gzip, deflate',
                    'Referer': 'http://www22.receita.fazenda.gov.br/inscricaomei/private/pages/certificado_acesso.jsf;jsessionid=' + cookie,
                    // 'Accept-Language': 'en-US,en;q=0.9,pt-BR;q=0.8,pt;q=0.7'
                    'DNT': 1,
                    'Connection': 'keep-alive',
                    'Upgrade-Insecure-Requests': 1,
                };
                const body = {
                    'j_id6': 'j_id6',
                    'uniqueToken': '',
                    'j_id6:downloadBtn': 'FAZER DOWNLOAD DO CERTIFICADO EM PDF',
                    'javax.faces.ViewState': viewStateValue
                };

                // console.log('\nHEADER >>>>>>>\n', headers);
                // console.log('\nBODY >>>>>>>\n', body);
                // console.log('\nCOOKIE >>>>>>>\n', cookie);

                this._crawler.driver.controlFlow().wait(this.downloadThroughPost(
                    'http://www22.receita.fazenda.gov.br/inscricaomei/private/pages/certificado.jsf;jsessionid=' + cookie,
                    headers, body, false, false))
                    .then(pdfBuffer => {
                        result.isPdf = Buffer.from(pdfBuffer).toString().toLowerCase().indexOf('pdf') > -1;
                        writeFileSync(join(__dirname, '..', 'download', 'certificado.pdf'), pdfBuffer, 'binary');
                        writeFileSync(join(__dirname, '..', 'download', 'certificado.html'), pdfBuffer, 'binary');
                    })
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
        return 'http://www22.receita.fazenda.gov.br/inscricaomei/private/pages/certificado_acesso.jsf';
    }

}

module.exports = Mei;