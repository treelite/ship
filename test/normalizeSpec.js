/**
 * @file normalize spec
 * @author treelite(c.xinle@gmail.com)
 */

'use strict';

import * as normalize from '../lib/normalize';

describe('Normalize', () => {

    describe('options for request', () => {

        it('base action', () => {
            let action = {
                url: 'https://www.baidu.com/search'
            };

            let options = normalize.options(action);

            expect(options.path).toEqual('/search');
            expect(options.method).toEqual('POST');
            expect(options.hostname).toEqual('www.baidu.com');
            expect(options.protocol).toEqual('https');
            expect(options.port).toBeUndefined();
            expect(options.headers).toEqual({'Content-Type': 'application/json'});
        });

        it('set port', () => {
            let action = {
                url: 'https://www.baidu.com:8080/search'
            };

            let options = normalize.options(action);

            expect(options.port).toEqual('8080');
        });

        it('set content-type', () => {
            let action = {
                url: 'https://www.baidu.com:8080/search',
                type: 'x-www-form-urlencoded',
                method: 'POST'
            };

            let options = normalize.options(action);

            expect(options.headers['Content-Type']).toEqual('application/x-www-form-urlencoded');
        });

        it('GET request', () => {
            let action = {
                url: 'https://www.baidu.com:8080/search',
                method: 'GET'
            };

            let options = normalize.options(action);

            expect(options.headers).toBeUndefined();
        });

    });

    describe('data for request', () => {

        it('normal params', () => {
            let params = {
                name: '${release.name}_${rep.num}_${rep.num}',
                str: 'hello'
            };

            let source = {
                release: {
                    name: 'treelite'
                },
                rep: {
                    num: 10
                }
            };

            let res = normalize.data(params, source);
            expect(res).not.toBe(params);
            expect(Object.keys(res).length).toEqual(2);
            expect(res.name).toEqual('treelite_10_10');
            expect(res.str).toEqual('hello');
        });

        it('miss params', () => {
            let params = {
                name: '${relase.name}',
                age: '${release.age}',
                str: 'hello'
            };

            let source = {
                release: {
                    name: 'treelite'
                }
            };

            let res = normalize.data(params, source);
            expect(res).toBeNull();
        });

    });

});
