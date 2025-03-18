import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Helper | get-relationships', function (hooks) {
	setupRenderingTest(hooks);

	test('get relationships of the project model', async function (assert) {
		let store = this.owner.lookup('service:store');
        this.set('store', store);

		await render(hbs`{{get-relationships 'project' this.store}}`);

        let projectRels = "owner,createdBy,modifiedBy,members,conversations,issues,roles,memberships,milestones,issuetypes,issuestatuses,activities";
		assert.dom(this.element).hasText(projectRels);
	});

	test('get relationships of the project model (hasOne only)', async function (assert) {
		let store = this.owner.lookup('service:store');
        this.set('store', store);

		await render(hbs`{{get-relationships 'project' this.store 'belongsTo'}}`);

        let projectRels = "owner,createdBy,modifiedBy";
		assert.dom(this.element).hasText(projectRels);
	});
    
	test('get relationships of the project model (hasMany only)', async function (assert) {
		let store = this.owner.lookup('service:store');
        this.set('store', store);

		await render(hbs`{{get-relationships 'project' this.store 'hasMany'}}`);

        let projectRels = "members,conversations,issues,roles,memberships,milestones,issuetypes,issuestatuses,activities";
		assert.dom(this.element).hasText(projectRels);
	});    
});

