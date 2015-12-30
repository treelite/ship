/**
 * @file Channel
 * @author treelite(c.xinle@gmail.com)
 */

'use strict';

import {Transform} from 'stream';

/**
 * 数据流管道
 *
 * @class
 * @extends Transform
 */
class Channel extends Transform {
    /**
     * 构造函数
     *
     * @public
     * @constructor
     * @param {Function} callback 数据处理回调
     */
    constructor(callback) {
        super();
        this.data = [];
        this.callback = callback;
    }

    /**
     * transform
     *
     * @private
     * @override
     * @param {Buffer|string} chunk 数据
     * @param {string} encoding 数据类型
     * @param {Function} done 数据处理完成回调
     */
    _transform(chunk, encoding, done) {
        this.data.push(chunk);
        done(null, chunk);
    }

    /**
     * flush
     *
     * @private
     * @override
     * @param {Function} done 处理回调
     */
    _flush(done) {
        this.callback.call(null, this.data.join(''));
        done();
    }
}

export default Channel;
