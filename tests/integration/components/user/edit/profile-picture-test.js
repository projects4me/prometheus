import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | user/edit/profile-picture', function (hooks) {
    setupRenderingTest(hooks);

    test('it renders', async function (assert) {
        this.set('uploadImageFn', () => true);

        await render(hbs`
            <User::Edit::ProfilePicture
                @uploadImage={{this.uploadImageFn}}
            />
        `);

        assert.dom('[data-field="user.image"]').exists();
    });
});
