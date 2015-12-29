/**
 * @file Meta spec
 * @author treelite(c.xinle@gmail.com)
 */

import fs from 'fs';
import path from 'path';
import Meta from '../lib/Meta';
import exists from '../lib/util/exists';

const FILE = path.resolve(__dirname, 'meta.json');

describe('Meta', () => {

    let meta;

    afterEach(() => {
        meta && meta.dispose();
        fs.unlinkSync(FILE);
    });

    it('init file', () => {
        expect(exists(FILE)).toBeFalsy();
        meta = new Meta(FILE);
        expect(exists(FILE)).toBeTruthy();
        let data = fs.readFileSync(FILE, 'utf8');
        expect(data).toEqual('{}');
    });

    it('realtime update', done => {
        meta = new Meta(FILE);

        let repo = 'test';
        let event = 'commit';
        let url = 'hello';

        expect(meta.get(repo, event)).toBeUndefined();

        let data = {};
        data[repo] = {};
        data[repo][event] = {url: url};

        fs.writeFile(FILE, JSON.stringify(data), 'utf8', () => setTimeout(
            () => {
                expect(meta.get(repo, event)).toEqual({url: url});
                done();
            },
            100
        ));

    });

    it('error', done => {
        let data = {url: 'hello'};
        fs.writeFileSync(FILE, JSON.stringify({test: {commit: data}}), 'utf8');
        meta = new Meta(FILE);
        expect(meta.get('test', 'commit')).toEqual(data);

        fs.writeFile(FILE, 'asdfasdf[]ddfa', 'utf8');

        meta.on('error', e => {
            expect(meta.get('test', 'commit')).toEqual(data);
            done();
        });
    });

});
