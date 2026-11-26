/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import Service from '@ember/service';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import IssueLinkLookup from 'prometheus/utils/gantt/issue-link-lookup';

const issue = (id, number, extra = {}) => ({
    id, issueNumber: number, subject: `Subject ${number}`, status: 'new', projectId: '1',
    startDate: '2026-11-10', endDate: '2026-11-13', ...extra
});

const link = (id, source, target) => ({
    id, type: 'blocks',
    belongsTo: (name) => ({ value: () => (name === 'sourceIssue' ? source : target), id: () => (name === 'sourceIssue' ? source : target).id })
});

module('Integration | Component | app-ui/gantt-chart/edit-sheet', function (hooks) {
    setupRenderingTest(hooks);

    hooks.beforeEach(function () {
        this.unlinked = [];
        const test = this;
        this.owner.register('service:issue-relations', class extends Service {
            unlink(target, row) {
                test.unlinked.push(row.link.id);
                return Promise.resolve();
            }
        });
        this.issue = issue('5', 5);
        const blocker = issue('2', 2);
        const blocked = issue('9', 9);
        this.links = new IssueLinkLookup([link('l1', blocker, this.issue), link('l2', this.issue, blocked)]);
        this.saved = [];
        this.onSaveDates = (target, start, end) => {
            this.saved.push([target.id, start, end]);
            return Promise.resolve();
        };
        this.noop = () => {};
    });

    const renderSheet = () => render(hbs`<AppUi::GanttChart::EditSheet
        @issue={{this.issue}} @links={{this.links}} @onSaveDates={{this.onSaveDates}} @onClose={{this.noop}} />`);

    test('shows the number, subject, duration and the blockers it depends on and blocks', async function (assert) {
        await renderSheet();
        assert.dom('.modal-title').hasText('#5');
        assert.dom('[data-test-gantt-edit-subject]').hasText('Subject 5');
        assert.dom('[data-test-gantt-edit-duration]').hasText('4 days long');
        assert.dom('[data-test-gantt-edit-blocker="2"]').hasText('#2 Subject 2');
        assert.dom('[data-test-gantt-edit-blocked="9"]').hasText('#9 Subject 9');
    });

    test('the shift buttons move both dates', async function (assert) {
        await renderSheet();
        await click('[data-test-gantt-edit-shift="7"]');
        await click('[data-test-gantt-edit-shift="-1"]');
        assert.dom('[data-field="ganttEdit.startDate"] input').hasValue('2026-11-16');
        assert.dom('[data-field="ganttEdit.endDate"] input').hasValue('2026-11-19');
        assert.dom('[data-test-gantt-edit-duration]').hasText('4 days long');
    });

    test('Save dates calls the update with both dates', async function (assert) {
        await renderSheet();
        await click('[data-test-gantt-edit-shift="1"]');
        await click('[data-btn="save"]');
        assert.deepEqual(this.saved, [['5', '2026-11-11', '2026-11-14']]);
    });

    test('removing a blocker unlinks it and drops it from the lookup', async function (assert) {
        await renderSheet();
        await click('[data-test-gantt-edit-remove="2"]');
        assert.deepEqual(this.unlinked, ['l1']);
        assert.dom('[data-test-gantt-edit-blocker="2"]').doesNotExist();
        assert.dom('[data-test-gantt-edit-no-blockers]').exists();
    });

    test('a refused save stays open and shows the message', async function (assert) {
        this.onSaveDates = () => Promise.reject({ errors: [{ detail: 'End before start' }] });
        await renderSheet();
        await click('[data-btn="save"]');
        assert.dom('[data-test-gantt-edit-error]').hasText('End before start');
        assert.dom('[data-test-gantt-edit-sheet]').exists();
    });
});
