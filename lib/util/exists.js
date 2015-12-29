/**
 * @file Is file exists ?
 * @author treelite(c.xinle@gmail.com)
 */

'use strict';

import fs from 'fs';

/**
 * 判断一个路径是否存在
 *
 * @public
 * @param {string} path 路径
 * @return {boolean}
 */
export default function (path) {
    let res = true;
    try {
        fs.accessSync(path);
    }
    catch (e) {
        res = false;
    }
    return res;
}
