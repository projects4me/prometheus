/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import steps from '../steps';

/**
 * Step definitions for the document title feature.
 *
 * @namespace Prometheus.Tests.Steps.App
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default function (assert) {
    return (
        steps(assert)
            .then('Browser tab title should be "$title"', async function (title) {
                assert.equal(
                    document.title,
                    title,
                    `Expected browser tab title to be "${title}" but got "${document.title}"`
                );
            })
            .then('Browser tab title should contain "$text"', async function (text) {
                assert.ok(
                    document.title.includes(text),
                    `Expected browser tab title "${document.title}" to contain "${text}"`
                );
            })
            .then('Browser tab title should not contain "$text"', async function (text) {
                assert.notOk(
                    document.title.includes(text),
                    `Expected browser tab title "${document.title}" to not contain "${text}"`
                );
            })
    );
}
