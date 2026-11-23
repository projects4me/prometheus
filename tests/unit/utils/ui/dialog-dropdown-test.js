/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { calculateDialogPosition, openDialogOf } from 'prometheus/utils/ui/dialog-dropdown';

const box = (left, top, width, height) => ({
    getBoundingClientRect: () => ({ left, top, width, height, right: left + width, bottom: top + height })
});

const dialogAt = (left, top, scrollTop = 0) => ({ ...box(left, top, 1000, 800), scrollLeft: 0, scrollTop });

module('Unit | Utility | ui/dialog-dropdown', function () {
    test('openDialogOf finds the open dialog that holds the trigger', function (assert) {
        let dialog = document.createElement('dialog');
        dialog.setAttribute('open', '');
        let trigger = document.createElement('div');
        trigger.setAttribute('data-ebd-id', 'ember42-trigger');
        dialog.appendChild(trigger);
        document.body.appendChild(dialog);
        let outside = document.createElement('div');
        outside.setAttribute('data-ebd-id', 'ember43-trigger');
        document.body.appendChild(outside);

        try {
            assert.strictEqual(openDialogOf('ember42'), dialog);
            assert.strictEqual(openDialogOf('ember43'), null, 'a trigger outside a dialog has none');
            assert.strictEqual(openDialogOf('missing'), null);
            assert.strictEqual(openDialogOf(undefined), null);
            dialog.removeAttribute('open');
            assert.strictEqual(openDialogOf('ember42'), null, 'a closed dialog does not count');
        } finally {
            dialog.remove();
            outside.remove();
        }
    });

    test('below the trigger, relative to the scrolled dialog, matching the trigger width', function (assert) {
        let result = calculateDialogPosition(box(100, 50, 200, 30), box(0, 0, 150, 100), dialogAt(0, 0, 40), { matchTriggerWidth: true });

        assert.strictEqual(result.verticalPosition, 'below');
        assert.strictEqual(result.horizontalPosition, 'left');
        assert.deepEqual(result.style, { left: 100, top: 120, width: 200 });
    });

    test('above the trigger when there is no room below', function (assert) {
        let top = window.innerHeight - 40;
        let result = calculateDialogPosition(box(10, top, 100, 30), box(0, 0, 100, 200), dialogAt(0, 0), {});

        assert.strictEqual(result.verticalPosition, 'above');
        assert.strictEqual(result.style.top, top - 200);
        assert.notOk('width' in result.style);
    });

    test('right-aligned when it would overflow the viewport on the right', function (assert) {
        let width = document.documentElement.clientWidth;
        let result = calculateDialogPosition(box(width - 120, 10, 100, 30), box(0, 0, 300, 50), dialogAt(0, 0), {});

        assert.strictEqual(result.horizontalPosition, 'right');
        assert.strictEqual(result.style.left, width - 20 - 300);
    });
});
