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
        this.set('plans', [{ id: '1', version: 1 }, { id: '2', version: 2 }]);
        this.set('planIssues', [
            { id: '10', ideaplanId: '2', issue: { projectShortcode: 'APROM', issueNumber: '5', subject: 'Second' } },
            { id: '11', ideaplanId: '1', issue: { projectShortcode: 'APROM', issueNumber: '4', subject: 'First' } }
        ]);
        await render(hbs`<Idea::CreatedIssuesBox @plans={{this.plans}} @planIssues={{this.planIssues}} />`);

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
});
