/**
 * @file Locker spec
 * @author treelite(c.xinle@gmail.com)
 */

import locker from '../lib/locker';

describe('Locker', () => {

    it('limit call', done => {
        let lock = locker(100, 1);
        let KEY = 'key';

        expect(lock(KEY)).toBeTruthy();
        expect(lock(KEY)).toBeFalsy();

        setTimeout(
            () => {
                expect(lock(KEY)).toBeTruthy();
                done();
            },
            150
        );
    });

});
