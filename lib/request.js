/**
 * @file Webhook pipe
 * @author treelite(c.xinle@gmail.com)
 */

'use strict';

import http from 'http';
import https from 'https';
import {stringify as json2Query} from 'querystring';

const METHOD_GET = 'GET';

/**
 * 附加数据
 *
 * @param {Object} options 请求参数
 * @param {Object} data 请求数据
 * @return {string}
 */
function attachData(options, data) {
    if (options.method === METHOD_GET) {
        data = json2Query(data);
        if (options.path.indexOf('?') >= 0) {
            options.path += '&';
        }
        else {
            options.path += '?';
        }
        options.path += data;
        data = null;
    }
    else if (options.headers['Content-Type'].indexOf('json') >= 0) {
        data = encodeURIComponent(JSON.stringify(data));
    }
    else {
        data = json2Query(data);
    }
    return data;
}

/**
 * HTTP(S) 请求
 *
 * @public
 * @param {Object} options 请求配置参数
 * @param {Object=} data 请求数据
 * @return {Promise}
 */
export default function (options, data) {
    if (data) {
        data = attachData(options, data);
    }

    let protocol = options.protocol === 'https' ? https : http;
    // FIXME
    // 不删除这个请求不会结束
    // Why ???
    delete options.protocol;
    return new Promise(resolve => protocol.request(options, resolve).end(data));
}
