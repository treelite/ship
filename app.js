/**
 * @file Ship App
 * @author treelite(c.xinle@gmail.com)
 */

'use strict';

import fs from 'fs';
import express from 'express';
import extend from 'xtend';
import logger from './lib/logger';
import exists from './lib/util/exists';
import pipe from './lib/pipe';
import Meta from './lib/meta';
import lock from './lib/lock';

let options = {
    port: 80,
    log: '/var/log/ship',
    meta: '/etc/ship/ship.json'
};

let file = process.argv[2];
if (file && exists(file)) {
    file = fs.readFileSync(file, 'utf8');
    let config = JSON.parse(file);
    options = extend(options, config);
}

let log = logger(options.log);

let meta = new Meta(options.meta);
meta.on('error', error => log.error('[meta] %s', error));

let app = express();

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
        return res.status(400);
    }

    pipe(action, data)
        .then(
            info => log.info('[pipe] %s', JSON.stringify(info), req.params),
            error => log.error('[pipe] %s', error, req.params)
        );

    res.status(200).end();
});

app.listen(options.port);

log.info('server start');
