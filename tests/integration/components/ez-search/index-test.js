/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, fillIn, focus, blur, settled } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import AclStub from '../../stub-services/acl-stub';
import { issueQuerySchema } from '../../../helpers/query-schema';

const INPUT = '[data-field="ez-search-input"] input, input[data-field="ez-search-input"]';

module('Integration | Component | ez-search', function (hooks) {
    setupRenderingTest(hooks);

    hooks.beforeEach(function () {
        this.owner.register('service:acl', AclStub);
        this.schema = issueQuerySchema();
        this.applied = [];
        this.onApply = (query) => this.applied.push(query);
        this.saved = [{ name: 'Done ones', query: '((Issue.status : done))' }];
        this.query = '';
        this.baseQuery = '';
        this.onSave = undefined;
    });

    async function show() {
        await render(hbs`<EzSearch
          @schema={{this.schema}}
          @query={{this.query}}
          @baseQuery={{this.baseQuery}}
          @savedSearches={{this.saved}}
          @onApply={{this.onApply}}
          @onSave={{this.onSave}}
          @aclContext="issue.read"
        />`);
    }

    test('typing updates the open panel and editing the panel updates the bar', async function (assert) {
        await show();
        await click('[data-ez-builder-toggle]');
        await focus(INPUT);
        await fillIn(INPUT, 'status:done');
        await blur(INPUT);

        assert.dom('[data-ez-condition]').exists({ count: 1 });
        assert.dom(INPUT).hasValue('((Issue.status : done))');
    });

    test('@query loads into the bar and the panel', async function (assert) {
        this.query = '((Issue.status : done))';
        await show();
        await click('[data-ez-builder-toggle]');

        assert.dom(INPUT).hasValue('((Issue.status : done))');
        assert.dom('[data-ez-condition]').exists({ count: 1 });
    });

    test('a stored query that does not parse shows its errors', async function (assert) {
        this.query = 'status:zzz';
        await show();

        assert.dom('[data-ez-stored-error]').exists();
    });

    test('choosing a saved search loads it and marks it', async function (assert) {
        await show();
        await click('.app-dropdown-btn');
        await click('[data-ez-saved-item]');

        assert.dom(INPUT).hasValue('((Issue.status : done))');
        await click('.app-dropdown-btn');
        assert.dom('[data-ez-saved-item] .fa-check').exists();
    });

    test('Search applies with the base query ANDed in', async function (assert) {
        this.baseQuery = '((Issue.projectId : p1))';
        this.query = '((Issue.status : done))';
        await show();
        await click('[data-ez-search-apply]');

        assert.strictEqual(this.applied.length, 1);
        assert.ok(this.applied[0].includes('Issue.projectId'));
        assert.ok(this.applied[0].includes('Issue.status'));
    });

    test('Clear empties both editors and applies the base query only', async function (assert) {
        this.baseQuery = '((Issue.projectId : p1))';
        this.query = '((Issue.status : done))';
        await show();
        await click('[data-ez-builder-toggle]');
        await click('[data-ez-search-clear]');

        assert.dom(INPUT).hasValue('');
        assert.dom('[data-ez-condition]').doesNotExist();
        assert.strictEqual(this.applied.length, 1);
        assert.ok(this.applied[0].includes('Issue.projectId'));
        assert.notOk(this.applied[0].includes('Issue.status'));
    });

    test('an invalid bar disables Search', async function (assert) {
        await show();
        await focus(INPUT);
        await fillIn(INPUT, 'status:zzz');
        await blur(INPUT);
        await settled();

        assert.dom('[data-ez-search-apply]').isDisabled();
    });

    test('the builder toggles the panel and Save Search needs @onSave', async function (assert) {
        await show();
        assert.dom('[data-ez-panel]').doesNotExist();
        await click('[data-ez-builder-toggle]');
        assert.dom('[data-ez-panel]').exists();
        assert.dom('[data-ez-save]').doesNotExist();
        await click('[data-ez-builder-toggle]');
        assert.dom('[data-ez-panel]').doesNotExist();

        let saved = [];
        this.set('onSave', (query) => saved.push(query));
        this.set('query', '((Issue.status : done))');
        await click('[data-ez-builder-toggle]');
        assert.dom('[data-ez-save]').exists();
        await click('[data-ez-save]');
        assert.deepEqual(saved, ['((Issue.status : done))']);
    });
});
