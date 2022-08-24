import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | user-profile/time-spent', function (hooks) {
    setupRenderingTest(hooks);

    test('it renders time spent component by passing some issue time spents', async function (assert) {
        let issues = [
            {
                spent: [
                    {
                        minutes: "0",
                        hours: "8",
                        days: "1"
                    }
                ]
            },
            {
                spent: [
                    {
                        minutes: "0",
                        hours: "7",
                        days: "1"
                    }
                ]
            }
            
        ]

        this.set('issueSpentValue', issues);

        await render(hbs`
            <UserProfile::TimeSpent
                @issues={{this.issueSpentValue}}
            />
        `);

        assert.dom('div[data-time-format="Days"]').hasAnyText('3');
        assert.dom('div[data-time-format="Hours"]').hasAnyText('7');
    });

    test('it renders time spent component without passing issue time spent', async function (assert) {
        let issues = [
            {
                spent: [

                ]
            }
        ]

        this.set('issueSpentValue', issues);

        await render(hbs`
            <UserProfile::TimeSpent
                @issues={{this.issueSpentValue}}
            />
        `);

        assert.dom('div[data-time-format="Hours"]').hasAnyText('0');
        assert.dom('div[data-time-format="Minutes"]').hasAnyText('0');
    });
});
