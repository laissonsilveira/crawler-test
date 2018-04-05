'use strict';
const express = require('express');
const request = require('request');
const { writeFileSync, existsSync, mkdirSync } = require('fs');
const { join } = require('path');
const app = express();
app.get('/pdf-mei', function (req, res) {
    const { init } = require('./collect');
    init('mei').then(result => {
        res.send(result);
    });
});
app.get('/download-pdf', function (req, response) {
    const options = {
        method: 'GET',
        url: 'http://localhost:3001/pdf-mei'
    };

    request(options, function (err, res, body) {
        if (err) throw new Error(err)
        const filePath = join(__dirname, 'download');
        if (!existsSync(filePath)) {
            mkdirSync(filePath);
        }
        const file = join(filePath, 'certificado.pdf');
        console.log('Savando arquivo em ' + file);//eslint-disable-line

        writeFileSync(file, JSON.parse(body).pdf, 'binary');
        response.json({ success: true })
    });
});
app.listen(3001);
console.log('Listening on port 3001...');//eslint-disable-line