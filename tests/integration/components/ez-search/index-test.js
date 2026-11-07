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
        this.saved = [{ id: 's1', name: 'Done ones', query: '((Issue.status : done))' }];
        this.query = '';
        this.baseQuery = '';
        this.onSave = undefined;
        this.activeId = undefined;
        this.changes = [];
        this.onChange = (search) => this.changes.push(search);
    });

    async function show() {
        await render(hbs`<EzSearch
          @schema={{this.schema}}
          @query={{this.query}}
          @baseQuery={{this.baseQuery}}
          @savedSearches={{this.saved}}
          @onApply={{this.onApply}}
          @onSave={{this.onSave}}
          @activeSavedSearchId={{this.activeId}}
          @onSavedSearchChange={{this.onChange}}
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

    test('the open saved searches menu lines up with the left edge of the button', async function (assert) {
        await show();
        await click('[data-ez-saved] button');
        const button = document.querySelector('[data-ez-saved] button').getBoundingClientRect();
        const menu = document.querySelector('[data-ez-saved] .app-dropdown-content').getBoundingClientRect();
        assert.true(menu.left >= button.left - 4, 'the menu does not start left of the button');
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

    test('Apply does nothing when @baseQuery does not parse', async function (assert) {
        this.baseQuery = '((Issue.status : zzz))';
        this.query = '((Issue.status : done))';
        await show();
        await click('[data-ez-search-apply]');

        assert.strictEqual(this.applied.length, 0);
    });

    test('loading a saved search drops invalid bar text and its errors', async function (assert) {
        this.saved = [{ name: 'Done', query: '((Issue.status : done))' }];
        await show();
        await focus(INPUT);
        await fillIn(INPUT, 'status:zzz');
        await blur(INPUT);
        await settled();
        assert.dom('[data-ez-search-apply]').isDisabled();

        await click('[data-ez-saved] button');
        await click('[data-ez-saved-item]');

        assert.dom('[data-ez-search-apply]').isNotDisabled();
        assert.dom(INPUT).doesNotIncludeText('zzz');
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

    test('@activeSavedSearchId marks the search and loads its query', async function (assert) {
        this.activeId = 's1';
        await show();

        assert.dom(INPUT).hasValue('((Issue.status : done))');
        await click('.app-dropdown-btn');
        assert.dom('[data-ez-saved-item] .fa-check').exists();
    });

    test('@query wins over @activeSavedSearchId but the mark stays', async function (assert) {
        this.activeId = 's1';
        this.query = '((Issue.status : new))';
        await show();

        assert.dom(INPUT).hasValue('((Issue.status : new))');
        await click('.app-dropdown-btn');
        assert.dom('[data-ez-saved-item] .fa-check').exists();
    });

    test('picking a saved search reports it and applies; picking it again reports null', async function (assert) {
        await show();
        await click('.app-dropdown-btn');
        await click('[data-ez-saved-item]');

        assert.strictEqual(this.changes.length, 1);
        assert.strictEqual(this.changes[0].id, 's1');
        assert.deepEqual(this.applied, ['((Issue.status : done))']);

        await click('.app-dropdown-btn');
        await click('[data-ez-saved-item]');

        assert.deepEqual(this.changes.slice(1), [null]);
        assert.dom(INPUT).hasValue('');
        assert.strictEqual(this.applied.length, 2);
    });

    test('Clear reports null', async function (assert) {
        this.activeId = 's1';
        await show();
        await click('[data-ez-search-clear]');

        assert.deepEqual(this.changes, [null]);
    });

    test('applying an edited query drops the mark and reports null', async function (assert) {
        this.activeId = 's1';
        await show();
        await focus(INPUT);
        await fillIn(INPUT, 'status:new');
        await blur(INPUT);

        await click('.app-dropdown-btn');
        assert.dom('[data-ez-saved-item] .fa-check').exists();
        assert.deepEqual(this.changes, []);

        await click('[data-ez-search-apply]');

        assert.deepEqual(this.changes, [null]);
        await click('.app-dropdown-btn');
        assert.dom('[data-ez-saved-item] .fa-check').doesNotExist();
    });
});
