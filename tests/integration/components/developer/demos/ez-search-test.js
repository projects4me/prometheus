/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, fillIn, triggerKeyEvent, settled } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import AclStub from '../../../stub-services/acl-stub';
import registry from 'prometheus/utils/developer/component-registry';

const INPUT = '[data-field="ez-search-input"] input, input[data-field="ez-search-input"]';

module('Integration | Component | developer/demos/ez-search', function (hooks) {
    setupRenderingTest(hooks);

    hooks.beforeEach(function () {
        this.owner.register('service:acl', AclStub);
        this.owner.setupRouter();
        this.entry = registry.find('ez-search');
    });

    test('the registry entry has three variants and the docs', function (assert) {
        assert.strictEqual(this.entry.group, 'Search');
        assert.strictEqual(this.entry.variants, 3);
        assert.strictEqual(this.entry.doc, 'ez-search.md');
    });

    test('it renders each variant and the controls', async function (assert) {
        await render(hbs`<Developer::Demos::EzSearch @entry={{this.entry}} />`);

        assert.dom('[data-ez-search]').exists();
        await click('[data-variant="multi"]');
        assert.dom('[data-ez-search-compact]').exists();
        assert.dom('.ez-search-compact-linear').doesNotExist();
        await click('[data-variant="linear"]');
        assert.dom('.ez-search-compact-linear').exists();
    });

    test('a preset loads the query and Apply logs the exact query string', async function (assert) {
        await render(hbs`<Developer::Demos::EzSearch @entry={{this.entry}} />`);

        await click('[data-ez-demo-query] [data-state="simple"]');
        await click('[data-ez-demo-base]');
        await fillIn(INPUT, 'priority:high');
        await triggerKeyEvent(INPUT, 'keydown', 'Enter', { ctrlKey: true });
        await settled();

        assert.dom('[data-event-log-row]').includesText('onApply');
        assert.dom('[data-event-log-row]').includesText("assignedTo.name : 'Hammad Hassan'");
        assert.dom('[data-event-log-row]').includesText('Issue.priority : High');
    });
});
