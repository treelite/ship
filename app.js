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

import Meta from './lib/Meta';
import logger from './lib/logger';
import request from './lib/request';
import Channel from './lib/Channel';
import exists from './lib/util/exists';
import * as normalize from './lib/normalize';

const ERROR_BANG = 500;
const ERROR_PARAMS = 400;
const ERROR_NOT_FOUND = 404;

let options = {
    port: 80,
    log: '/var/log/ship',
    meta: '/etc/ship/meta.json'
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

let app = express();

// 访问日志
app.use((req, res, next) => {
    let finishHandler = () => {
        let code = res.statusCode;
        let data = [code, req.params];
        data.unshift(code >= 200 && code < 300 ? 'success' : 'fail');
        log[code >= ERROR_BANG ? 'error' : 'info']('trigger %s %d', ...data);
    };
    res.on('finish', finishHandler);
    next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.post('/:repository/:event', (req, res) => {
    let {repository, event} = req.params;
    let action = meta.get(repository, event);

    if (!action) {
        return res.status(ERROR_NOT_FOUND).end();
    }

    let source = req.body;

    let data;
    if (action.params) {
        data = normalize.data(action.params, source);
        // 数据源不合法
        // 拒绝服务
        if (!data) {
            return res.status(ERROR_PARAMS).end();
        }
    }

    let options = normalize.options(action);
    log.info('trigger', {repository, event, options, data});

    let logChannel = new Channel(res => log.info('trigger response', {repository, event, res}));
    logChannel.on('pipe', src => res.status(src.statusCode));
    request(options, data).then(result => result.pipe(logChannel).pipe(res));
});

// 异常错误处理
app.use((error, req, res, next) => {
    log.error('unkown error: %s %s', error.message, req.url, {stack: error.stack});
    res.status(ERROR_BANG).end();
});

// 404
app.use((req, res) => res.status(ERROR_NOT_FOUND).end());

app.listen(options.port);

log.info('server start at %d', options.port);
