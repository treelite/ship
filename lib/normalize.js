/**
 * @file 参数组织
 * @author teelite(c.xinle@gmail.com)
 */

'use strict';

import {parse as parseURL} from 'url';

const METHOD_POST = 'POST';
const REG_PARAM = /\${([^}]+)}/g;

/**
 * 解析参数
 *
 * @param {Object} data 数据源
 * @param {string} key 参数名
 * @return {*}
 */
function parse(data, key) {
    let keys = key.split('.');
    let len = keys.length;
    let i = 0;
    while (data.hasOwnProperty(keys[i]) && i < len) {
        data = data[keys[i++]];
    }

    if (i < len) {
        throw new Error('param not found');
    }

    return data;
}

/**
 * 组织请求数据
 *
 * @public
 * @param {Object} action 行为信息
 * @param {Object} source 数据源
 * @return {!Object}
 */
export function data(action, source) {
    let params = action.params;
    let replacer = ($0, $1) => parse(source, $1);
    for (let key of Object.keys(params)) {
        let value = params[key];
        try {
            value = value.replace(REG_PARAM, replacer);
        }
        catch (e) {
            // 数据源中没有需要的参数
            // 认为是数据不合法
            return null;
        }
        params[key] = value;
    }
    return params;
}

/**
 * 组织请求参数
 *
 * @public
 * @param {Object} action 行为信息
 * @return {Object}
 */
export function options(action) {
    let url = parseURL(action.url);
    let res = {
        path: url.path,
        method: action.method || METHOD_POST,
        hostname: url.hostname,
        protocol: url.protocol.replace(':', '')
    };

    if (url.port) {
        res.port = url.port;
    }

    if (res.method === METHOD_POST) {
        res.headers = {
            'Content-Type': 'application/' + (action.type || 'json')
        };
    }

    return res;
}
