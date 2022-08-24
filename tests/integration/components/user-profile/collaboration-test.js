import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | user-profile/collaboration', function (hooks) {
    setupRenderingTest(hooks);

    let expectedCollaborationValues = [
        {
            key: 0,
            value: "0%"
        },
        {
            key: 1,
            value: "13%"
        }
    ]

    expectedCollaborationValues.forEach((expectedCollaborationValue) => {
        test(`it renders the collaboration component by ${expectedCollaborationValue.key}`, async function (assert) {
            this.set('value', expectedCollaborationValue.key);

            await render(hbs`
                <UserProfile::Collaboration 
                    @numberOfComments={{this.value}}
                />
            `);

            assert.dom('div[data-user-collaboration="value"]').hasText(`${expectedCollaborationValue.value}`);

        });
    });
});
