import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import Service from '@ember/service';

class AclStub extends Service {
    allowed = true;
    checkAccess(context) {
        return context === 'tagged.create' ? this.allowed : true;
    }
}

module('Integration | Component | conversation/tags-box', function (hooks) {
    setupRenderingTest(hooks);

    hooks.beforeEach(function () {
        this.owner.register('service:acl', AclStub);
        this.set('tags', [{ id: '1', tag: { tag: 'backend' } }]);
        this.set('noop', () => {});
    });

    test('with tagged.create it shows the add field and the remove buttons', async function (assert) {
        await render(hbs`<Conversation::TagsBox @tags={{this.tags}} @suggest={{this.noop}} @onAdd={{this.noop}} @onRemove={{this.noop}} />`);
        assert.dom('[data-tag-chip]').hasText('backend');
        assert.dom('[data-tags-edit]').exists();
        assert.dom('[data-app-ui-tag-remove]').exists();
    });

    test('without tagged.create it shows the tags only', async function (assert) {
        this.owner.lookup('service:acl').allowed = false;
        await render(hbs`<Conversation::TagsBox @tags={{this.tags}} @suggest={{this.noop}} @onAdd={{this.noop}} @onRemove={{this.noop}} />`);
        assert.dom('[data-tag-chip]').hasText('backend');
        assert.dom('[data-tags-edit]').doesNotExist();
        assert.dom('[data-app-ui-tag-remove]').doesNotExist();
    });
});
