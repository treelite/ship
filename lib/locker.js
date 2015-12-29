/**
 * @file Requect locker
 * @author treelite (c.xinle@gmail.com)
 */

'use strict';

/**
 * 默认的时效
 * 5 分钟
 *
 * @const
 * @type {number}
 */
const TIME = 5 * 60 * 1000;

/**
 * 默认时效内的最大访问次数
 * 1 次
 *
 * @const
 * @type {number}
 */
const MAX = 1;

class Locker {
    constructor(time = TIME, max = MAX) {
        this.time = time;
        this.max = max;
        this.pool = new Map();
    }

    lock(key) {
        let data = this.pool.get(key);
        if (!data) {
            this.pool.set(key, {time: Date.now(), count: 1});
            return true;
        }

        let now = Date.now();
        if (now - data.time > this.time) {
            this.pool.set(key, {time: now, count: 1});
            return true;
        }

        if (data.count < this.max) {
            data.count++;
            this.pool.set(key, data);
            return true;
        }

        return false;
    }
}

/**
 * 生成锁
 *
 * @public
 * @param {number=} time 时效
 * @param {number=} max 时效内的最大访问次数
 * @return {boolean}
 */
export default function (time, max) {
    let locker = new Locker(time, max);
    return key => locker.lock(key);
}
