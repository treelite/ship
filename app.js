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
        let data = [res.statusCode, req.params];
        if (res.statusCode >= ERROR_BANG) {
            log.error('tigger fail %d', ...data);
        }
        else {
            log.info('tigger success %d', ...data);
        }
    };
    res.on('finish', finishHandler);
    next();
});

app.use(bodyParser.text({type: '*/*'}));

// FIXME
// 规范错误处理
app.post('/:repository/:event', (req, res) => {
    let {repository, event} = req.params;
    let action = meta.get(repository, event);

    if (!action) {
        return res.status(ERROR_NOT_FOUND).end();
    }

    // TODO
    // 支持非 JSON 的数据请求
    let source = req.body || '{}';
    try {
        source = JSON.parse(decodeURIComponent(source));
    }
    catch (e) {
        return res.status(ERROR_PARAMS).end();
    }

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
    res.on('pipe', src => res.status(src.statusCode));
    // TODO
    // 日志记录请求的返回数据
    request(options, data).then(result => result.pipe(res));
});

app.use((error, req, res, next) => {
    log.error('unkown error: %s %s', error.message, req.url, {stack: error.stack});
    res.status(ERROR_BANG).end();
});

app.use((req, res) => res.status(ERROR_NOT_FOUND).end());

app.listen(options.port);

log.info('server start at %d', options.port);
