import { module, test } from 'qunit';
import registry, { ComponentRegistry, GROUPS } from 'prometheus/utils/developer/component-registry';

const ENTRIES = [
    { name: 'menu', label: 'Context Menu', group: 'Menus', status: 'stable', summary: 'Opens on right click.' },
    { name: 'list', label: 'Quick List', group: 'Lists', status: 'stable', summary: 'Pages and groups rows.' },
    { name: 'search', label: 'EzSearch', group: 'Search', status: 'experimental', summary: 'Builds a query for the list.' }
];

module('Unit | Utility | developer/component-registry', function () {

    test('find returns the entry by name, or null', function (assert) {
        let subject = new ComponentRegistry(ENTRIES);
        assert.strictEqual(subject.find('list').label, 'Quick List');
        assert.strictEqual(subject.find('nope'), null);
    });

    test('first is the first entry, or null when empty', function (assert) {
        assert.strictEqual(new ComponentRegistry(ENTRIES).first.name, 'menu');
        assert.strictEqual(new ComponentRegistry([]).first, null);
    });

    test('grouped orders by the groups and drops empty ones', function (assert) {
        let groups = new ComponentRegistry(ENTRIES).grouped();
        assert.deepEqual(groups.map(g => g.group), ['Lists', 'Search', 'Menus']);
        assert.deepEqual(groups[0].entries.map(e => e.name), ['list']);
    });

    test('grouped filters by label or summary, case-insensitively', function (assert) {
        let subject = new ComponentRegistry(ENTRIES);
        assert.deepEqual(subject.grouped('quick').map(g => g.group), ['Lists']);
        assert.deepEqual(subject.grouped('  QUERY ').map(g => g.group), ['Search']);
        assert.deepEqual(subject.grouped('nothing'), []);
    });

    test('grouped puts entries of an unknown group last', function (assert) {
        let subject = new ComponentRegistry([...ENTRIES, { name: 'x', label: 'X', group: 'Charts', summary: '' }]);
        assert.deepEqual(subject.grouped().map(g => g.group), ['Lists', 'Search', 'Menus', 'Charts']);
    });

    test('the application registry uses the known groups', function (assert) {
        assert.ok(registry.entries.every(entry => GROUPS.includes(entry.group)));
        assert.ok(registry.entries.every(entry => ['stable', 'experimental'].includes(entry.status)));
    });
});
