const chalk = require('chalk');

module.exports = {
    info: (msg) => console.log(chalk.blue('[INFO]') + ' ' + msg),
    sucesso: (msg) => console.log(chalk.green('[SUCESSO]') + ' ' + msg),
    aviso: (msg) => console.log(chalk.yellow('[AVISO]') + ' ' + msg),
    erro: (msg) => console.error(chalk.red('[ERRO]') + ' ' + msg)
};
