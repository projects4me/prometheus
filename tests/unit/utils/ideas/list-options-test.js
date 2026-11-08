/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import {
    buildSortOptions,
    buildCreators,
    buildGroupOptions,
    buildSort
} from 'prometheus/utils/ideas/list-options';

const intl = { t: key => `t:${key}` };

module('Unit | Utility | ideas/list-options', function () {
    test('sort options list modified, created and title', function (assert) {
        let options = buildSortOptions(intl);
        assert.deepEqual(options.map(o => o.key), ['Idea.dateModified', 'Idea.dateCreated', 'Idea.title']);
        assert.strictEqual(options[2].label, 't:views.app.idea.browser.sort.title');
    });

    test('group options are none, plan status and created by', function (assert) {
        let options = buildGroupOptions({ intl, progress: {}, creators: new Map() });
        assert.deepEqual(options.map(o => o.key), ['none', 'planStatus', 'createdBy']);
        assert.notOk(options[0].groupKey);
    });

    test('plan status groups by the progress label, null when unknown', function (assert) {
        let progress = { 1: { label: 'views.app.idea.status.archived' } };
        let group = buildGroupOptions({ intl, progress, creators: new Map() })[1];
        assert.strictEqual(group.groupKey({ id: '1' }), 'views.app.idea.status.archived');
        assert.strictEqual(group.groupKey({ id: '2' }), null);
        assert.strictEqual(group.groupLabel('a.b'), 't:a.b');
    });

    test('created by groups by creator and names them', function (assert) {
        let creators = new Map([['7', 'Ada']]);
        let group = buildGroupOptions({ intl, progress: {}, creators })[2];
        assert.strictEqual(group.groupKey({ createdUser: '7' }), '7');
        assert.strictEqual(group.groupLabel(7), 'Ada');
        assert.strictEqual(group.groupLabel('9'), 't:views.app.idea.browser.unknownUser');
    });

    test('creators map ids to the loaded creator names', function (assert) {
        let idea = (id, name) => ({ createdUser: id, belongsTo: () => ({ value: () => (name ? { name } : null) }) });
        let creators = buildCreators([idea('1', 'Ada'), idea('2', null)]);
        assert.strictEqual(creators.get('1'), 'Ada');
        assert.strictEqual(creators.get('2'), undefined);
    });

    test('buildSort defaults to the modified date', function (assert) {
        assert.strictEqual(buildSort(), 'Idea.dateModified');
        assert.strictEqual(buildSort({ sort: 'Idea.title', group: 'none' }), 'Idea.title');
    });

    test('buildSort puts Idea.createdUser first when grouped by creator', function (assert) {
        assert.strictEqual(buildSort({ sort: 'Idea.title', group: 'createdBy' }), 'Idea.createdUser,Idea.title');
    });
});
