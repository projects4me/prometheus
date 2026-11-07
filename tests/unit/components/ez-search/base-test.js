/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setComponentTemplate } from '@ember/component';
import EzSearchBase from 'prometheus/components/ez-search/base';
import { issueQuerySchema } from '../../../helpers/query-schema';

let probes = [];

/**
 * A layout-less subclass: Glimmer components can only be built by the renderer, so this one is rendered and
 * kept to drive the base class directly.
 */
class Probe extends EzSearchBase {
    constructor(owner, args) {
        super(owner, args);
        probes.push(this);
    }
}

setComponentTemplate(hbs`<span data-probe></span>`, Probe);

module('Unit | Component | ez-search/base', function (hooks) {
    setupRenderingTest(hooks);

    const DONE = '((Issue.status : done))';

    hooks.beforeEach(function () {
        this.owner.register('component:ez-search-probe', Probe);
        this.applied = [];
        this.changes = [];
        this.saved = [{ id: 's1', name: 'Done ones', query: DONE }];
        this.make = async (args = {}) => {
            this.args = {
                schema: issueQuerySchema(),
                savedSearches: this.saved,
                onApply: (query) => this.applied.push(query),
                onSavedSearchChange: (search) => this.changes.push(search),
                ...args,
            };
            await render(hbs`<EzSearchProbe
              @schema={{this.args.schema}}
              @query={{this.args.query}}
              @baseQuery={{this.args.baseQuery}}
              @savedSearches={{this.args.savedSearches}}
              @onApply={{this.args.onApply}}
              @onSave={{this.args.onSave}}
              @onSavedSearchChange={{this.args.onSavedSearchChange}}
            />`);

            return probes[probes.length - 1];
        };
    });

    test('parse: @query loads into the tree and a bad query reports errors', async function (assert) {
        let base = await this.make({ query: DONE });

        assert.strictEqual(base.currentQuery, DONE);
        assert.strictEqual(base.storedErrors.length, 0);

        let broken = await this.make({ query: '((' });

        assert.ok(broken.storedErrors.length > 0);
    });

    test('apply: reports the query, composed with @baseQuery', async function (assert) {
        let base = await this.make({ query: DONE });

        await base.apply();
        assert.strictEqual(this.applied.length, 1);

        let withBase = await this.make({ query: DONE, baseQuery: '((Issue.projectId : 7))' });

        await withBase.apply();
        assert.ok(this.applied[1].includes('projectId'));
        assert.ok(this.applied[1].includes('status'));
    });

    test('clear: empties the tree, reports null and applies', async function (assert) {
        let base = await this.make({ query: DONE });

        await base.clear();
        assert.strictEqual(base.currentQuery, '');
        assert.deepEqual(this.changes, [null]);
        assert.strictEqual(this.applied.length, 1);
    });

    test('select and deselect a saved search', async function (assert) {
        let base = await this.make();
        let search = this.saved[0];

        await base.pickSaved(search);
        assert.strictEqual(base.pickedSearch, search);
        assert.strictEqual(base.currentQuery, DONE);
        assert.deepEqual(this.changes, [search]);
        assert.ok(base.searches[0].active);

        await base.pickSaved(search);
        assert.strictEqual(base.pickedSearch, null);
        assert.strictEqual(base.currentQuery, '');
        assert.deepEqual(this.changes, [search, null]);
    });

    test('builder toggles and save reports the current query', async function (assert) {
        let saved = [];
        let base = await this.make({ query: DONE, onSave: (query) => saved.push(query) });

        assert.false(base.builderOpen);
        base.toggleBuilder();
        assert.true(base.builderOpen);
        base.save();
        assert.deepEqual(saved, [DONE]);
    });
});
