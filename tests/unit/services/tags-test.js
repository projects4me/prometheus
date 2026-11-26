import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { Response } from 'miragejs';
import Context from '../../../mirage/yadda-context/context';

module('Unit | Service | tags', function (hooks) {
    setupTest(hooks);
    setupMirage(hooks);

    hooks.beforeEach(function () {
        new Context().clear();
        this.service = this.owner.lookup('service:tags');
        this.store = this.owner.lookup('service:store');
    });

    test('suggest returns the project tags that contain the text, sorted', async function (assert) {
        this.server.create('tag', { projectId: '1', tag: 'zebra-bug' });
        this.server.create('tag', { projectId: '1', tag: 'Bug' });
        this.server.create('tag', { projectId: '1', tag: 'ui' });
        this.server.create('tag', { projectId: '2', tag: 'bug-other-project' });

        let tags = await this.service.suggest(1, 'bug');

        assert.deepEqual(tags.map((tag) => tag.tag), ['Bug', 'zebra-bug']);
    });

    test('attach reuses an existing tag whatever its letter case', async function (assert) {
        let existing = this.server.create('tag', { projectId: '1', tag: 'Backend' });

        let tagged = await this.service.attach(1, 'issue', 7, ' backend ');

        assert.strictEqual(this.server.schema.tags.all().length, 1, 'no tag is created');
        assert.strictEqual(tagged.tagId, String(existing.id));
        assert.strictEqual(tagged.relatedTo, 'issue');
        assert.strictEqual(tagged.relatedId, '7');
        assert.strictEqual(this.server.schema.taggeds.all().length, 1);
    });

    test('attach creates the tag in the project when it is missing', async function (assert) {
        let tagged = await this.service.attach(3, 'conversationroom', 9, 'Urgent');

        let created = this.server.schema.tags.all().models[0];
        assert.strictEqual(created.tag, 'Urgent');
        assert.strictEqual(String(created.projectId), '3');
        assert.strictEqual(tagged.tagId, String(created.id));
    });

    test('attach looks the tag up again when another user created it first (422)', async function (assert) {
        let lookups = 0;
        this.server.get('/tag', (schema) => {
            lookups++;
            // The first lookup runs before the other user's tag exists
            return lookups === 1 ? schema.tags.none() : schema.tags.all();
        });
        let posts = 0;
        this.server.post('/tag', () => {
            posts++;
            this.server.create('tag', { projectId: '1', tag: 'Race' });
            return new Response(422, {}, { status: 'ERROR', messages: ['duplicate'] });
        });

        let tagged = await this.service.attach(1, 'issue', 4, 'race');

        assert.strictEqual(posts, 1);
        assert.strictEqual(lookups, 2);
        assert.strictEqual(this.server.schema.tags.all().length, 1, 'only the other user\'s tag exists');
        assert.strictEqual(tagged.tagId, String(this.server.schema.tags.all().models[0].id));
    });

    test('attach rethrows a 422 when the tag cannot be found afterwards', async function (assert) {
        this.server.get('/tag', (schema) => schema.tags.none());
        this.server.post('/tag', () => new Response(422, {}, { status: 'ERROR', messages: ['invalid'] }));

        await assert.rejects(this.service.attach(1, 'issue', 4, 'x'));
        assert.strictEqual(this.server.schema.taggeds.all().length, 0);
    });

    test('forRecord returns the tag links of the record with their tags', async function (assert) {
        let tag = this.server.create('tag', { projectId: '1', tag: 'Mine' });
        this.server.create('tagged', { relatedTo: 'issue', relatedId: '7', tagId: tag.id });
        this.server.create('tagged', { relatedTo: 'issue', relatedId: '8', tagId: tag.id });
        this.server.create('tagged', { relatedTo: 'wiki', relatedId: '7', tagId: tag.id });

        let rows = await this.service.forRecord('issue', 7);

        assert.strictEqual(rows.length, 1);
        assert.strictEqual((await rows[0].tag).tag, 'Mine');
    });

    test('detach deletes the link and keeps the tag', async function (assert) {
        let tagged = await this.service.attach(1, 'issue', 7, 'Keep');

        await this.service.detach(tagged);

        assert.strictEqual(this.server.schema.taggeds.all().length, 0);
        assert.strictEqual(this.server.schema.tags.all().length, 1);
    });
});
