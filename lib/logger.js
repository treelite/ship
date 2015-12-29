/**
 * @file Log
 * @author treelite(c.xinle@gmail.com)
 */

'use strict';

import path from 'path';
import mkdirp from 'mkdirp';
import winston from 'winston';
import exists from './util/exists';
import DailyRotateFile from 'winston-daily-rotate-file';

let Logger = winston.Logger;

/**
 * 数字补齐2位
 *
 * @param {number} n 数字
 * @return {string}
 */
function pad(n) {
    return (n >= 10 ? '' : '0') + n;
}

/**
 * 日期格式化
 *
 * @param {Object} time 日期时间对象
 * @return {string}
 */
function timeFormat(time) {
    return time.getFullYear()
        + '-'
        + pad(time.getMonth() + 1)
        + '-'
        + pad(time.getDate())
        + ' '
        + pad(time.getHours())
        + ':'
        + pad(time.getMinutes())
        + ':'
        + pad(time.getSeconds());
}

/**
 * 序列化信息
 *
 * @param {Object} options 数据
 * @return {string}
 */
function stringify(options) {
    let res = {
        level: options.level,
        time: timeFormat(new Date(options.timestamp)),
        message: options.message
    };

    for (let key in options) {
        if (!(key in res)) {
            res[key] = options[key];
        }
    }
    return JSON.stringify(res);
}

/**
 * 日志
 *
 * @public
 * @param {string} dir 日志目录
 * @param {boolean} debug 启动debug模式
 * @return {Object}
 */
export default function (dir) {
    if (!exists(dir)) {
        mkdirp.sync(dir);
    }

    let transport = new DailyRotateFile({
        level: 'info',
        filename: path.resolve(dir, 'core.log'),
        datePattern: '.yyyy-MM-dd',
        stringify: stringify
    });

    return new Logger({
        transports: [transport]
    });
}
