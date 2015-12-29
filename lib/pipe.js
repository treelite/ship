/**
 * @file Webhook pipe
 * @author treelite(c.xinle@gmail.com)
 */

'use strict';

import http from 'http';
import https from 'https';
import {stringify} from 'querystring';
import {parse} from 'url';

const METHOD_GET = 'GET';
const METHOD_POST = 'POST';
const CONTENT_TYPE_JSON = 'json';

function request(url, options) {
    url = parse(url);
    let params = {
        method: options.method,
        hostname: url.hostname,
        path: url.path
    };

    if (url.port) {
        params.port = url.port;
    }

    let data = options.data;
    let contentType = options.contentType;
    if (options.method === METHOD_GET) {
        data = stringify(data);
        if (params.path.indexOf('?') >= 0) {
            params.path += '&';
        }
        else {
            params.path += '?';
        }
        params.path += data;
        data = null;
    }
    else {
        data = contentType === CONTENT_TYPE_JSON
            ? encodeURIComponent(JSON.stringify(data))
            : stringify(data);
        params.headers = {
            'Content-Type': 'application/' + contentType
        };
    }

    return new Promise((resolve, reject) => {
        let protocol = url.protocol === 'https:' ? https : http;
        let req = protocol.request(
            params,
            res => {
                if (res.statusCode !== 200) {
                    return reject(res.statusCode);
                }

                let buffer = [];
                res.on('data', chunk => buffer.push(chunk));
                res.on('end', () => {
                    resolve(buffer.join(''));
                });
            }
        );

        if (data) {
            req.write(data);
        }

        req.end();
    });
}

function query(data, key) {
    let keys = key.split('.');
    let len = keys.length;
    let i = 0;
    while (data.hasOwnProperty(keys[i]) && i < len) {
        data = data[keys[i++]];
    }

    return i === len ? data : undefined;
}

function getParams(action, data) {
    let params = action.params;
    let replacer = ($0, $1) => query(data, $1);
    for (let key of Object.keys(params)) {
        let value = params[key];
        value = value.replace(/\${([^}]+)}/g, replacer);
        params[key] = value;
    }
    return params;
}

export default function (action, data) {
    let params = getParams(action, data);

    return request(action.url, {
        method: action.method || METHOD_POST,
        contentType: action.contentType || 'json',
        data: params
    });
}
