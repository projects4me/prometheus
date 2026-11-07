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

    test('the bar has no form-field margin and shares a row with the Search button', async function (assert) {
        await show();

        const field = document.querySelector('[data-ez-search-bar] .form-field');
        const style = getComputedStyle(field);
        ['Top', 'Right', 'Bottom', 'Left'].forEach((side) => assert.strictEqual(style[`margin${side}`], '0px', `margin ${side}`));

        // The layout depends on the real window width (ez-search.scss wraps at max-width: 767px), which a test cannot set.
        const bar = document.querySelector('[data-ez-search-bar]').getBoundingClientRect();
        const button = document.querySelector('[data-ez-search-apply]').getBoundingClientRect();
        if (window.innerWidth > 767) {
            assert.ok(Math.abs(bar.top - button.top) <= 4, `bar and Search share a row (${bar.top} vs ${button.top})`);
        } else {
            assert.ok(button.top >= bar.bottom - 1, `bar and Search wrap onto separate rows (${bar.bottom} vs ${button.top})`);
        }
    });

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
        assert.true(Math.abs(menu.left - button.left) <= 4, 'the menu lines up with the left edge of the button');
        assert.true(menu.right <= window.innerWidth, 'the menu stays inside the viewport');
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

    async function edit() {
        await focus(INPUT);
        await fillIn(INPUT, 'status:new');
        await blur(INPUT);
    }

    test('the button shows the active name with a title, and no edited marker while unchanged', async function (assert) {
        this.activeId = 's1';
        await show();

        assert.dom('[data-ez-saved-name]').hasText('Done ones').hasAttribute('title', 'Done ones');
        assert.dom('[data-ez-saved-edited]').doesNotExist();
    });

    test('without an active search the button keeps its label', async function (assert) {
        await show();

        assert.dom('[data-ez-saved-name]').doesNotExist();
        assert.dom('[data-ez-saved] button').includesText('Saved Searches');
    });

    test('editing keeps the search active, shows edited and reports nothing', async function (assert) {
        this.activeId = 's1';
        await show();
        await edit();
        await click('[data-ez-search-apply]');

        assert.dom('[data-ez-saved-name]').hasText('Done ones');
        assert.dom('[data-ez-saved-edited]').exists();
        assert.deepEqual(this.changes, []);
        await click('.app-dropdown-btn');
        assert.dom('[data-ez-saved-item] .fa-check').exists();
    });

    test('the edited menu offers Update and Save as new only for given callbacks, and Revert', async function (assert) {
        this.activeId = 's1';
        await show();
        await click('.app-dropdown-btn');
        assert.dom('[data-ez-saved-revert]').doesNotExist();
        await click('.app-dropdown-btn');

        await edit();
        await click('.app-dropdown-btn');
        assert.dom('[data-ez-saved-update]').doesNotExist();
        assert.dom('[data-ez-saved-save-new]').doesNotExist();
        assert.dom('[data-ez-saved-revert]').exists();
    });

    test('Update hands the edited query over, makes it the saved one and applies it', async function (assert) {
        let updates = [];

        this.activeId = 's1';
        this.onUpdate = (search, query) => updates.push([search.id, query]);
        await render(hbs`<EzSearch
          @schema={{this.schema}}
          @savedSearches={{this.saved}}
          @activeSavedSearchId={{this.activeId}}
          @onApply={{this.onApply}}
          @onUpdateSavedSearch={{this.onUpdate}}
          @aclContext="issue.read"
        />`);
        await edit();
        await click('.app-dropdown-btn');
        assert.dom('[data-ez-saved-update]').includesText('Update "Done ones"');
        await click('[data-ez-saved-update]');

        assert.deepEqual(updates, [['s1', '((Issue.status : new))']]);
        assert.deepEqual(this.applied, ['((Issue.status : new))']);
        assert.dom('[data-ez-saved-edited]').doesNotExist();
        assert.dom('[data-ez-saved-name]').hasText('Done ones');
    });

    test('Save as new hands the edited query to @onSave', async function (assert) {
        let saved = [];

        this.activeId = 's1';
        this.onSave = (query) => saved.push(query);
        await show();
        await edit();
        await click('.app-dropdown-btn');
        await click('[data-ez-saved-save-new]');

        assert.deepEqual(saved, ['((Issue.status : new))']);
    });

    test('Revert loads the saved query back and applies it', async function (assert) {
        this.activeId = 's1';
        await show();
        await edit();
        await click('.app-dropdown-btn');
        await click('[data-ez-saved-revert]');

        assert.dom(INPUT).hasValue('((Issue.status : done))');
        assert.dom('[data-ez-saved-edited]').doesNotExist();
        assert.dom('[data-ez-saved-name]').hasText('Done ones');
        assert.deepEqual(this.applied, ['((Issue.status : done))']);
    });

    test('picking another search ends the edited state', async function (assert) {
        this.saved = [...this.saved, { id: 's2', name: 'Open ones', query: '((Issue.status : open))' }];
        this.activeId = 's1';
        await show();
        await edit();
        await click('.app-dropdown-btn');
        await click('[data-ez-saved-item]:last-of-type');

        assert.dom('[data-ez-saved-name]').hasText('Open ones');
        assert.dom('[data-ez-saved-edited]').doesNotExist();
        assert.strictEqual(this.changes[this.changes.length - 1].id, 's2');
    });

    test('Clear ends the edited state and the active search', async function (assert) {
        this.activeId = 's1';
        await show();
        await edit();
        await click('[data-ez-search-clear]');

        assert.dom('[data-ez-saved-name]').doesNotExist();
        assert.dom('[data-ez-saved-edited]').doesNotExist();
        assert.deepEqual(this.changes, [null]);
    });
});
