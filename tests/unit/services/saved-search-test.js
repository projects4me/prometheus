/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Service from '@ember/service';
import { recordArray } from '../../helpers/record-array';

module('Unit | Service | saved-search', function (hooks) {
    setupTest(hooks);

    hooks.beforeEach(function () {
        let calls = [];

        this.calls = calls;
        this.owner.register('service:store', class extends Service {
            query(type, options) {
                calls.push([type, options]);

                return Promise.resolve(recordArray(['a']));
            }
        });
        this.owner.register('service:current-user', class extends Service {
            user = { id: '7' };
        });
        this.service = this.owner.lookup('service:saved-search');
    });

    function record() {
        return {
            saved: 0,
            set(key, value) {
                this[key] = value;
            },
            save() {
                this.saved++;

                return Promise.resolve(this);
            },
        };
    }

    test("load queries the current user's searches of a module and project", async function (assert) {
        let result = await this.service.load('issue', 3);

        assert.deepEqual(result, ['a']);
        assert.deepEqual(this.calls[0], [
            'savedsearch',
            {
                query: '((Savedsearch.relatedTo : issue) AND (Savedsearch.projectId : 3) AND (Savedsearch.createdUser : 7))',
                limit: -1,
            },
        ]);
    });

    test('load without a project leaves the project out', async function (assert) {
        await this.service.load('project');

        assert.strictEqual(this.calls[0][1].query, '((Savedsearch.relatedTo : project) AND (Savedsearch.createdUser : 7))');
    });

    test('create sets module, query and project, then saves', async function (assert) {
        let item = record();

        await this.service.create(item, { relatedTo: 'issue', query: '((a))', projectId: '3' });

        assert.strictEqual(item.relatedTo, 'issue');
        assert.strictEqual(item.searchquery, '((a))');
        assert.strictEqual(item.projectId, '3');
        assert.strictEqual(item.saved, 1);
    });

    test('create leaves the project alone when there is none', async function (assert) {
        let item = record();

        await this.service.create(item, { relatedTo: 'project', query: '((a))' });

        assert.notOk('projectId' in item);
    });

    test('update replaces the query and saves', async function (assert) {
        let item = record();

        await this.service.update(item, '((b))');

        assert.strictEqual(item.searchquery, '((b))');
        assert.strictEqual(item.saved, 1);
    });
});
