/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | idea/created-issues-box', function (hooks) {
    setupRenderingTest(hooks);

    test('issues are grouped by plan version and show their short code and subject', async function (assert) {
        this.set('readable', ['1']);
        this.set('plans', [{ id: '1', version: 1 }, { id: '2', version: 2 }]);
        this.set('planIssues', [
            { id: '10', ideaplanId: '2', loadedIssue: { projectId: '1', projectShortcode: 'APROM', issueNumber: '5', subject: 'Second' } },
            { id: '11', ideaplanId: '1', loadedIssue: { projectId: '1', projectShortcode: 'APROM', issueNumber: '4', subject: 'First' } }
        ]);
        await render(hbs`<Idea::CreatedIssuesBox @plans={{this.plans}} @planIssues={{this.planIssues}} @readableProjectIds={{this.readable}} />`);

        assert.dom('[data-idea-created-group]').exists({ count: 2 });
        assert.dom('[data-idea-created-group="1"] + ul').includesText('APROM-4');
        assert.dom('[data-idea-created-group="1"] + ul').includesText('First');
        assert.dom('[data-idea-created-group="2"] + ul').includesText('Second');
    });

    test('the empty state shows when no issue was created', async function (assert) {
        this.set('plans', []);
        this.set('planIssues', []);
        await render(hbs`<Idea::CreatedIssuesBox @plans={{this.plans}} @planIssues={{this.planIssues}} />`);

        assert.dom('[data-idea-created-empty]').exists();
    });

    test('only issues of readable projects are links, the others and links without an issue are plain text', async function (assert) {
        this.set('readable', ['1']);
        this.set('plans', [{ id: '1', version: 1, body: JSON.stringify({ issues: [{ key: 'c', subject: 'Planned' }] }) }]);
        this.set('planIssues', [
            { id: '10', ideaplanId: '1', key: 'a', loadedIssue: { projectId: '1', projectShortcode: 'APROM', issueNumber: '4', subject: 'Mine' } },
            { id: '11', ideaplanId: '1', key: 'b', loadedIssue: { projectId: '2', projectShortcode: 'AGAIA', issueNumber: '9', subject: 'Theirs' } },
            { id: '12', ideaplanId: '1', key: 'c' }
        ]);
        await render(hbs`<Idea::CreatedIssuesBox @plans={{this.plans}} @planIssues={{this.planIssues}} @readableProjectIds={{this.readable}} />`);

        assert.dom('[data-idea-created-issue="10"] a').exists();
        assert.dom('[data-idea-created-issue="11"] a').doesNotExist();
        assert.dom('[data-idea-created-issue="11"] .text-muted').hasText('AGAIA-9 Theirs');
        assert.dom('[data-idea-created-issue="12"] a').doesNotExist();
        assert.dom('[data-idea-created-issue="12"] .text-muted').hasText('c Planned');
    });

    test('a record link shows the loaded issue and falls back to the plan item without fetching the unloaded one', async function (assert) {
        let store = this.owner.lookup('service:store');
        let requests = 0;
        let adapter = store.adapterFor('issue');
        adapter.findRecord = () => { requests++; return Promise.reject(new Error('unexpected fetch')); };
        store.push({ data: [
            { type: 'issue', id: '7', attributes: { projectId: '1', projectShortcode: 'APROM', issueNumber: '7', subject: 'Loaded' } },
            { type: 'ideaplanissue', id: '10', attributes: { ideaplanId: '1', key: 'a' }, relationships: { issue: { data: { type: 'issue', id: '7' } } } },
            { type: 'ideaplanissue', id: '11', attributes: { ideaplanId: '1', key: 'b' }, relationships: { issue: { data: { type: 'issue', id: '8' } } } }
        ] });
        this.set('readable', ['1']);
        this.set('plans', [{ id: '1', version: 1 }]);
        this.set('planIssues', [store.peekRecord('ideaplanissue', '10'), store.peekRecord('ideaplanissue', '11')]);
        await render(hbs`<Idea::CreatedIssuesBox @plans={{this.plans}} @planIssues={{this.planIssues}} @readableProjectIds={{this.readable}} />`);

        assert.dom('[data-idea-created-issue="10"] a').includesText('APROM-7');
        assert.dom('[data-idea-created-issue="11"] .text-muted').hasText('b');
        assert.strictEqual(requests, 0, 'the unloaded issue is not fetched');
    });
});
