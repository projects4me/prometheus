/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { isHexColor, labelStyle, labelTextColor } from 'prometheus/utils/color';

module('Unit | Utility | color', function () {
    test('it accepts only 6-digit hex colours', function (assert) {
        assert.true(isHexColor('#80b5d3'));
        assert.true(isHexColor('#1A2B3C'));

        let invalid = ['red', '#fff', '#12345g', '#1234567', '80b5d3', 'url(x)', '', null, undefined];
        assert.deepEqual(invalid.filter(isHexColor), [], 'none of the other values is a hex colour');
    });

    test('the label text is black when dark and white otherwise', function (assert) {
        assert.strictEqual(labelTextColor('dark'), '#000000');
        assert.strictEqual(labelTextColor('light'), '#ffffff');
        assert.strictEqual(labelTextColor(null), '#ffffff', 'a status saved without one is light');
        assert.strictEqual(labelTextColor('toString'), '#ffffff');
    });

    test('it builds a label style only from a hex colour', function (assert) {
        assert.strictEqual(labelStyle('#1a2b3c'), 'background-color: #1a2b3c; color: #ffffff');
        assert.strictEqual(labelStyle('#1a2b3c', { important: true }), 'background-color: #1a2b3c !important; color: #ffffff !important');
        assert.strictEqual(labelStyle('#1a2b3c', { textColor: 'dark' }), 'background-color: #1a2b3c; color: #000000');
        assert.strictEqual(labelStyle('red;position:fixed'), '');
        assert.strictEqual(labelStyle('#fff;background:url(x)'), '');
        assert.strictEqual(labelStyle('#fff'), '');
        assert.strictEqual(labelStyle(null), '');
    });
});
