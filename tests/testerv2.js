// eslint-disable-next-line strict
'use strict';

const path = require('path');
const fs = require('fs');
const chalk = require('chalk');

const {logger: loggerClass, Client} = require(path.resolve(__dirname,'..','src'));
const channels = ['arunabot', 'talesgardem', 'lobometalurgico', 'space_interprise'];

const mainChannel = channels[Math.floor(Math.random() * channels.length)];

var testFailed = false;

var actualCheck = 0;
var checks = 0;

const client = new Client({
    debug: true,
    autoLogEnd: false,
    channels: [mainChannel],
    http: {
        hostID: 'https://api.twitchapis.org',
    },
    ws: {
        host: 'irc.twitchapis.org',
        port: '80',
        type: 'ws'
    }
});

const logger = new loggerClass();

const scriptDir = path.resolve(__dirname,'scripts');

var tests = [];

async function runTests() {
    for (var i = 0; i <= checks - 1; i++) {
        actualCheck = i + 1;
        logger.info(`[Tester]: Starting test: "${chalk.blueBright(tests[i].name)}" [${actualCheck}/${checks}]`);

        // eslint-disable-next-line no-await-in-loop
        await tests[i].run(logger, client, channels, mainChannel, i).catch((e) => {
            logger.warn(`[Tester]: Error on test: "${chalk.yellow(tests[i].name)}". Error: ${e}`);
            testFailed = false;
        });
    }
}

async function run() {
    logger.info('Starting tests...');

    const files = await fs.readdirSync(scriptDir);

    const jsfile = files.filter(f => f.split('.').pop() === 'js');

    if (jsfile.length <= 0) {
        return logger.fatal('[Tester]: No Tests found!');
    }

    files.forEach(file => {
        const eventFunction = require(`${scriptDir}/${file}`);
        logger.info(`[Tester] => ${chalk.blueBright(eventFunction.name)}`);
        tests.push(eventFunction);
    });
    
    tests.sort((a, b) => a.order - b.order);
    checks = tests.length;
    await runTests();
    if (testFailed) {
        logger.error('[Tester]: 1 or more tests failed. Please check what happened.');
        return process.exit(1);
    }
    logger.info('[Tester]: Tests successfully completed!');
}

run();