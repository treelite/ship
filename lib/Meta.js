/**
 * @file Meta
 * @author treelite(c.xinle@gmail.com)
 */

'use strict';

import fs from 'fs';
import path from 'path';
import extend from 'xtend';
import mkdirp from 'mkdirp';
import Emitter from 'events';
import exists from './util/exists';

/**
 * 初始化元数据
 *
 * @param {string} file 文件路径
 * @return {Object}
 */
function initFile(file) {
    let data = {};
    let dir = path.dirname(file);
    if (!exists(dir)) {
        mkdirp.sync(dir);
    }
    fs.writeFileSync(file, JSON.stringify(data), 'utf8');
    return data;
}

/**
 * 元数据管理
 *
 * @class
 * @extends Emitter
 */
class Meta extends Emitter {

    /**
     * 构造函数
     *
     * @public
     * @constructor
     * @param {string} file 文件路径
     */
    constructor(file) {
        super();

        if (!exists(file)) {
            this.data = initFile(file);
        }
        else {
            this.data = JSON.parse(fs.readFileSync(file, 'utf8'));
        }

        let update = (error, data) => {
            if (error) {
                return this.emit('error', error);
            }

            try {
                data = JSON.parse(data);
            }
            catch (e) {
                return this.emit('error', e);
            }

            this.data = data;
        };

        fs.watch(file, event => {
            if (event === 'change') {
                fs.readFile(file, 'utf8', update);
            }
        });
    }

    /**
     * 获取元数据
     *
     * @public
     * @param {string} repository 仓库名
     * @param {string} event 事件名
     * @return {Object}
     */
    get(repository, event) {
        let res = this.data[repository] || {};
        return res[event] && extend(res[event]);
    }

}

export default Meta;
