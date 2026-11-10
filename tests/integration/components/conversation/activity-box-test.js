import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { buildActivityLines } from 'prometheus/utils/conversation/room-activity';

module('Integration | Component | conversation/activity-box', function (hooks) {
    setupRenderingTest(hooks);

    const activity = (id, type, context, dateCreated = '2026-01-0' + id + ' 10:00:00') => ({
        id: String(id), type, context, createdUserName: 'Rana Nouman', dateCreated
    });

    test('it writes one sentence per kind Gaia records', async function (assert) {
        this.set('activities', {
            hasMore: false,
            records: [
                activity(1, 'created', {}),
                activity(2, 'updated', { field: 'subject' }),
                activity(3, 'updated', { field: 'description' }),
                activity(4, 'linked', { newIssueNumber: 7 }),
                activity(5, 'linked', { oldIssueNumber: 7, newIssueNumber: 9 }),
                activity(6, 'unlinked', { oldIssueNumber: 9 })
            ]
        });
        await render(hbs`<Conversation::ActivityBox @activities={{this.activities}} @roomType="discussion" />`);
        let sentences = [...this.element.querySelectorAll('[data-activity-sentence]')].map((el) => el.textContent.trim());
        assert.deepEqual(sentences, [
            'Rana Nouman started the thread',
            'Rana Nouman edited the subject',
            'Rana Nouman edited the description',
            'Rana Nouman linked issue #7',
            'Rana Nouman changed the linked issue from #7 to #9',
            'Rana Nouman cleared the linked issue #9'
        ]);
        assert.dom('[data-btn="show-more-activities"]').doesNotExist();
    });

    test('a vote says the vote was started, and Show more asks for the rest', async function (assert) {
        let loaded = 0;
        this.set('activities', { hasMore: true, records: [activity(1, 'created', {})], loadAll: () => loaded++ });
        await render(hbs`<Conversation::ActivityBox @activities={{this.activities}} @roomType="vote" />`);
        assert.dom('[data-activity-sentence]').hasText('Rana Nouman started the vote');
        await click('[data-btn="show-more-activities"]');
        assert.strictEqual(loaded, 1);
    });

    test('it shows the empty text with no activities', async function (assert) {
        this.set('activities', { hasMore: false, records: [] });
        await render(hbs`<Conversation::ActivityBox @activities={{this.activities}} @roomType="discussion" />`);
        assert.dom('[data-activity-empty]').exists();
    });

    test('the date is the time today and DD MMM before', function (assert) {
        let today = moment().format('YYYY-MM-DD') + ' 09:30:00';
        let [a, b] = buildActivityLines([activity(1, 'created', {}, today), activity(2, 'created', {}, '2020-03-04 10:00:00')], 'discussion');
        assert.strictEqual(a.date, '09:30');
        assert.strictEqual(b.date, '04 Mar');
    });
});
