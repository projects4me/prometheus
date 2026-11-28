import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import Service from '@ember/service';

class AclStub extends Service {
    allowed = true;
    checkAccess(context) {
        return context === 'tagged.create' || context === 'tagged.delete' ? this.allowed : true;
    }
}

module('Integration | Component | conversation/tags-box', function (hooks) {
    setupRenderingTest(hooks);

    hooks.beforeEach(function () {
        this.owner.register('service:acl', AclStub);
        this.set('tags', [{ id: '1', tag: { tag: 'backend' } }]);
        this.set('noop', () => {});
    });

    test('it shows plain chips and the plus when the user may tag', async function (assert) {
        await render(hbs`<Conversation::TagsBox @tags={{this.tags}} @projectId="p1" @threadId="1" @threadTitle="T" @onSaved={{this.noop}} />`);
        assert.dom('[data-tag-chip]').hasText('backend');
        assert.dom('[data-app-ui-tag-remove]').doesNotExist();
        assert.dom('[data-tags-edit]').doesNotExist();
        assert.dom('[data-btn="edit-tags"]').exists();
    });

    test('without tagged.create or tagged.delete it shows the tags only', async function (assert) {
        this.owner.lookup('service:acl').allowed = false;
        await render(hbs`<Conversation::TagsBox @tags={{this.tags}} @projectId="p1" @threadId="1" @threadTitle="T" @onSaved={{this.noop}} />`);
        assert.dom('[data-tag-chip]').hasText('backend');
        assert.dom('[data-btn="edit-tags"]').doesNotExist();
    });

    test('with no tags the empty text stays', async function (assert) {
        this.set('tags', []);
        await render(hbs`<Conversation::TagsBox @tags={{this.tags}} @projectId="p1" @threadId="1" @threadTitle="T" @onSaved={{this.noop}} />`);
        assert.dom('[data-tags-empty]').exists();
    });
});
