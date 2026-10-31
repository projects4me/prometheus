/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { isHexColor, labelStyle, labelTextColor, readableTextColor } from 'prometheus/utils/color';

module('Unit | Utility | color', function () {
    test('it accepts only 6-digit hex colours', function (assert) {
        assert.true(isHexColor('#80b5d3'));
        assert.true(isHexColor('#1A2B3C'));

        let invalid = ['red', '#fff', '#12345g', '#1234567', '80b5d3', 'url(x)', '', null, undefined];
        assert.deepEqual(invalid.filter(isHexColor), [], 'none of the other values is a hex colour');
    });

    test('it picks black text on light colours and white text on dark ones', function (assert) {
        assert.strictEqual(readableTextColor('#ffffff'), '#000000');
        assert.strictEqual(readableTextColor('#fff3a0'), '#000000');
        assert.strictEqual(readableTextColor('#f7bf65'), '#000000');
        assert.strictEqual(readableTextColor('#000000'), '#ffffff');
        assert.strictEqual(readableTextColor('#b3244f'), '#ffffff');
        assert.strictEqual(readableTextColor('#1a2b3c'), '#ffffff');
        assert.strictEqual(readableTextColor('red'), null);
    });

    test('a chosen text colour wins over the automatic one', function (assert) {
        assert.strictEqual(labelTextColor('#1a2b3c', 'dark'), '#000000');
        assert.strictEqual(labelTextColor('#fff3a0', 'light'), '#ffffff');
        assert.strictEqual(labelTextColor('#1a2b3c', null), '#ffffff');
        assert.strictEqual(labelTextColor('#fff3a0', null), '#000000');
        assert.strictEqual(labelTextColor('#1a2b3c', 'toString'), '#ffffff', 'an unknown choice is automatic');
        assert.strictEqual(labelTextColor('red', 'dark'), null);
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
