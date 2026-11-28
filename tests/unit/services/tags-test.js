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

    test('forRecords returns the tags of many records with one request, sorted by name', async function (assert) {
        let zeta = this.server.create('tag', { projectId: '1', tag: 'zeta' });
        let alpha = this.server.create('tag', { projectId: '1', tag: 'alpha' });
        this.server.create('tagged', { relatedTo: 'issue', relatedId: '7', tagId: zeta.id, tag: zeta });
        this.server.create('tagged', { relatedTo: 'issue', relatedId: '7', tagId: alpha.id, tag: alpha });
        this.server.create('tagged', { relatedTo: 'issue', relatedId: '8', tagId: zeta.id, tag: zeta });
        this.server.create('tagged', { relatedTo: 'issue', relatedId: '9', tagId: zeta.id, tag: zeta });
        this.server.create('tagged', { relatedTo: 'wiki', relatedId: '7', tagId: zeta.id, tag: zeta });
        let requests = 0;
        this.server.pretender.handledRequest = (verb, path) => {
            if (path.includes('/tagged')) {
                requests += 1;
            }
        };

        let byRecord = await this.service.forRecords('issue', [7, 8]);

        assert.strictEqual(requests, 1, 'one request');
        assert.deepEqual(byRecord.get('7').map((tag) => tag.tag), ['alpha', 'zeta']);
        assert.deepEqual(byRecord.get('8').map((tag) => tag.tag), ['zeta']);
        assert.false(byRecord.has('9'), 'a record that was not asked for is not in the Map');
    });

    test('forRecords asks for nothing when there are no ids', async function (assert) {
        let byRecord = await this.service.forRecords('issue', []);

        assert.strictEqual(byRecord.size, 0);
    });

    test('detach deletes the link and keeps the tag', async function (assert) {
        let tagged = await this.service.attach(1, 'issue', 7, 'Keep');

        await this.service.detach(tagged);

        assert.strictEqual(this.server.schema.taggeds.all().length, 0);
        assert.strictEqual(this.server.schema.tags.all().length, 1);
    });

    test('findOther finds another project tag by name, whatever its case, never the tag itself', async function (assert) {
        this.server.create('tag', { projectId: '1', tag: 'Ember 7' });
        let own = this.server.create('tag', { projectId: '1', tag: 'Ember 6.5' });
        this.server.create('tag', { projectId: '2', tag: 'Other' });
        let record = await this.store.findRecord('tag', own.id);

        assert.strictEqual((await this.service.findOther(1, 'ember 7', record)).tag, 'Ember 7');
        assert.strictEqual(await this.service.findOther(1, 'ember 6.5', record), null, 'not itself');
        assert.strictEqual(await this.service.findOther(1, 'other', record), null, 'not another project');
        assert.strictEqual(await this.service.findOther(1, '  ', record), null);
    });

    test('rename saves the new name', async function (assert) {
        let own = this.server.create('tag', { projectId: '1', tag: 'Ember 6.5' });
        let record = await this.store.findRecord('tag', own.id);

        await this.service.rename(record, ' Ember 7 ');

        assert.strictEqual(this.server.schema.tags.find(own.id).tag, 'Ember 7');
    });

    test('a refused rename restores the name and throws', async function (assert) {
        this.server.create('tag', { projectId: '1', tag: 'Ember 7' });
        let own = this.server.create('tag', { projectId: '1', tag: 'Ember 6.5' });
        let record = await this.store.findRecord('tag', own.id);

        await assert.rejects(this.service.rename(record, 'ember 7'));
        assert.strictEqual(record.tag, 'Ember 6.5');
    });

    test('merge moves the records to the target and drops the tag', async function (assert) {
        let source = this.server.create('tag', { projectId: '1', tag: 'Ember 6.5' });
        let target = this.server.create('tag', { projectId: '1', tag: 'Ember 7' });
        this.server.create('tagged', { tagId: String(source.id), relatedTo: 'issue', relatedId: '5' });
        let record = await this.store.findRecord('tag', source.id);
        let targetRecord = await this.store.findRecord('tag', target.id);

        let result = await this.service.merge(record, targetRecord);

        assert.strictEqual(result, targetRecord);
        assert.strictEqual(this.server.schema.tags.find(source.id), null);
        assert.strictEqual(this.server.schema.taggeds.all().models[0].tagId, String(target.id));
    });

    test('remove deletes the tag and its links', async function (assert) {
        let tag = this.server.create('tag', { projectId: '1', tag: 'Old' });
        this.server.create('tagged', { tagId: String(tag.id), relatedTo: 'issue', relatedId: '5' });
        let record = await this.store.findRecord('tag', tag.id);

        await this.service.remove(record);

        assert.strictEqual(this.server.schema.tags.all().length, 0);
        assert.strictEqual(this.server.schema.taggeds.all().length, 0);
    });

    test('usage counts the issues and the threads with the totals of Gaia', async function (assert) {
        let tag = this.server.create('tag', { projectId: '1', tag: 'Ember' });
        for (let id of ['1', '2', '3']) {
            this.server.create('tagged', { tagId: String(tag.id), relatedTo: 'issue', relatedId: id });
        }
        this.server.create('tagged', { tagId: String(tag.id), relatedTo: 'conversationroom', relatedId: '9' });
        let record = await this.store.findRecord('tag', tag.id);

        assert.deepEqual(await this.service.usage(record), { issues: 3, threads: 1 });
    });
});
