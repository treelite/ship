/**
 * @file Ship App
 * @author treelite(c.xinle@gmail.com)
 */

'use strict';

import fs from 'fs';
import path from 'path';
import extend from 'xtend';
import express from 'express';
import bodyParser from 'body-parser';

import pipe from './lib/pipe';
import Meta from './lib/meta';
import locker from './lib/locker';
import logger from './lib/logger';
import exists from './lib/util/exists';

let options = {
    port: 80,
    log: '/var/log/ship',
    meta: '/etc/ship/ship.json'
};

let file = process.argv[2];
if (file && exists(file)) {
    let config = JSON.parse(fs.readFileSync(file, 'utf8'));
    let dir = path.dirname(file);
    if (config.log) {
        config.log = path.resolve(dir, config.log);
    }
    if (config.meta) {
        config.meta = path.resolve(dir, config.meta);
    }
    options = extend(options, config);
}

let log = logger(options.log);

let meta = new Meta(options.meta);
meta.on('error', error => log.error('meta: %s', error));

let lock = locker();

let app = express();

// 访问日志
app.use((req, res, next) => {
    res.on('finish', () => {
        if (res.statusCode >= 500) {
            log.error('access: %d %s', res.statusCode, req.url);
        }
        else {
            log.info('access: %d %s', res.statusCode, req.url);
        }
    });
    next();
});

app.use(bodyParser.text({type: '*/*'}));

// FIXME
// 规范错误处理
app.post('/:repository/:event', (req, res) => {
    let {repository, event} = req.params;
    let action = meta.get(repository, event);

    if (!action) {
        return res.status(404).end();
    }

    if (!lock(`${repository}-${event}`)) {
        return res.status(403).end();
    }

    let data;
    try {
        data = JSON.parse(decodeURIComponent(req.body));
    }
    catch (e) {
        return res.status(400).end();
    }

    log.info('pipe receive', extend({data: JSON.stringify(data)}, req.params));
    pipe(action, data)
        .then(
            info => log.info('pipe success: %s', JSON.stringify(info), req.params),
            error => log.error('pipe fail: %s', error, req.params)
        );

    res.status(200).end();
});

app.use((error, req, res, next) => {
    log.error('unkown error: %s %s', error.message, req.url, {stack: error.stack});
    res.status(500).end();
});

app.use((req, res) => {
    res.status(404).end();
});

app.listen(options.port);

log.info('server start at %d', options.port);
