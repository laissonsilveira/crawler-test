'use strict';
if (!process.argv[2]) throw Error('Informe o nome do site!');

const { init } = require('./collect');
init(process.argv[2]);