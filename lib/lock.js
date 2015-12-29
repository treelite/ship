/**
 * @file Requect locker
 * @author treelite (c.xinle@gmail.com)
 */

'use strict';

/**
 * 时效
 * 5分钟
 *
 * @const
 * @type {number}
 */
const TIME = 5 * 60 * 1000;

/**
 * 时效内的最大访问次数
 *
 * @const
 * @type {number}
 */
const MAX = 1;

let pool = new Map();

export default function (key) {
    let data = pool.get(key);
    if (!data) {
        pool.set(key, {time: Date.now(), count: 1});
        return true;
    }

    let now = Date.now();
    if (now - data.time > TIME) {
        pool.set(key, {time: now, count: 1});
        return true;
    }

    if (data.count < MAX) {
        data.count++;
        pool.set(key, data);
        return true;
    }

    return false;
}
