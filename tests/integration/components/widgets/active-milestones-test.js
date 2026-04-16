import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import CurrentUserStub from '../../stub-services/current-user-stub';

module('Integration | Component | widgets/active-milestones', function (hooks) {
	setupRenderingTest(hooks);
	setupMirage(hooks);

	hooks.beforeEach(function(assert) {
		this.owner.register('service:current-user', CurrentUserStub);
	});

	test('it renders', async function (assert) {
        let milestones = this.server.createList('milestone', 3);
        let project = this.server.create('project');
        let metadata = {
            fields: ['name', 'project', 'status', 'overview'],
            translationKey: 'views.app.milestone.fields',
            searchFields: ['name', 'project.name']
        }   
        
        const statusMap = {
            'complete': 'Complete',
            'closed': 'Closed',
            'completed': 'Completed',
            'in_progress': 'In Progress',
            'planned': 'Planned',
            'overdue': 'Overdue',
            'deferred': 'Deferred',
            'failed': 'Failed'
        };
        
        milestones.forEach(milestone => {
            milestone.project = project;
        });
        this.set('milestones', milestones);
        this.set('metadata', metadata);
        await render(hbs`<Widgets::ActiveMilestones @data={{this.milestones}} @widgetSettings={{this.metadata}}/>`);

        assert.dom('[data-active-milestones-table]').exists('Table exists');
        assert.dom('[data-active-milestones-table] tbody tr').exists({ count: 3 }, 'Has 3 milestone rows');
        milestones.forEach((milestone, index) => {
            const row = `[data-active-milestones-table] tbody tr:nth-child(${index + 1})`;
            assert.dom(`${row} td:nth-child(1)`).hasText(milestone.name, `Row ${index + 1} has correct name`);
            assert.dom(`${row} td:nth-child(2)`).hasText(project.name, `Row ${index + 1} has correct project name`);
            assert.dom(`${row} td:nth-child(3) span.badge`).hasText(statusMap[milestone.status], `Row ${index + 1} has correct status`);
            assert.dom(`${row} td:nth-child(4) [data-active-milestone-overview="${milestone.id}"]`).exists(`Row ${index + 1} has overview cell`);
        });
	});
});
