import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | app-ui/timeline', function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);

    test('it renders timeline component with some activities', async function (assert) {
        this.server.createList('activity', 2);
        let activities = [];

        //update activites based on datecreated
        server.schema.activities.all().models.forEach(activity => {
            let dateCreated = activity.dateCreated;
            if (activities[dateCreated] !== undefined) {
                activities[dateCreated]['data'].push(activity);
            }
            else {
                activities[dateCreated] = { dateCreated: dateCreated, data: [activity] };
            }
        });
        this.set('activities', activities);

        await render(hbs`
            <AppUi::Timeline
                @activities={{this.activities}}
            />
        `);

        assert.dom('ul.timeline').exists();
        
        server.schema.activities.all().models.forEach(activity => {
            assert.dom(`li[data-activity-block-type="${activity.relatedTo}-${activity.type}"]`).exists();
        });
    });
});
