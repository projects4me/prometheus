/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';

// The resolved values of $gantt-bar-colours in styles/modules/gantt.scss (darken() lowers the HSL lightness).
// Keep this map in step with the SCSS map.
const BAR_COLOURS = {
    new: '#1b7bba', // $secondaryColor
    in_progress: '#b3244f', // $primaryColor
    in_review: '#640c44', // $highlightColor
    feedback: '#976008', // darken($warningColor, 14%)
    done: '#347f25', // darken($successColor, 22%)
    closed: '#d33724', // $dangerColor
    deferred: '#707070', // darken($mediumColor, 16%)
};

function luminance(hex) {
    let [r, g, b] = [1, 3, 5].map((i) => {
        let c = parseInt(hex.slice(i, i + 2), 16) / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastWithWhite(hex) {
    return 1.05 / (luminance(hex) + 0.05);
}

module('Unit | Gantt | bar colours', function () {
    test('every bar colour gives white labels at least 4.5:1 contrast', function (assert) {
        Object.entries(BAR_COLOURS).forEach(([status, hex]) => {
            let ratio = contrastWithWhite(hex);
            assert.true(ratio >= 4.5, `${status} ${hex} has contrast ${ratio.toFixed(2)}`);
        });
    });
});
