/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { selectChoose, selectSearch } from 'ember-power-select/test-support/helpers';
import { scopeOptions, searchScopes } from 'prometheus/utils/agent-scopes';
import AclStub from '../../stub-services/acl-stub';

module('Integration | Component | delegation scopes field', function (hooks) {
    setupRenderingTest(hooks);

    test('it shows the chosen scopes, offers wildcards and accepts free entry', async function (assert) {
        this.owner.register('service:acl', AclStub);
        let chosen = [];
        this.set('options', scopeOptions());
        this.set('selected', [{ label: 'issue.read', value: 'issue.read' }]);
        this.set('search', (term) => searchScopes(scopeOptions(), term));
        this.set('onchange', (scopes) => {
            chosen = scopes.map((scope) => scope.value);
            this.set('selected', scopes);
        });

        await render(hbs`
            <FormFields::FieldRelateMulti
                @relateType="relate-simple"
                @label="Delegation scopes"
                @data-field="agent.delegationScopes"
                @options={{this.options}}
                @selected={{this.selected}}
                @search={{this.search}}
                @searchEnabled={{true}}
                @onchange={{this.onchange}}
            />
        `);

        assert.dom('span.relate-simple').hasText('issue.read');

        await selectSearch('[data-field="agent.delegationScopes"]', 'issue.*');
        await selectChoose('[data-field="agent.delegationScopes"]', 'issue.*');
        assert.deepEqual(chosen, ['issue.read', 'issue.*'], 'a module wildcard can be picked');

        await selectSearch('[data-field="agent.delegationScopes"]', 'custom.thing');
        await selectChoose('[data-field="agent.delegationScopes"]', 'custom.thing');
        assert.deepEqual(chosen, ['issue.read', 'issue.*', 'custom.thing'], 'free entry is accepted');
    });
});
