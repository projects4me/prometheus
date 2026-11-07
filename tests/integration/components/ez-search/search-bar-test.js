import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, fillIn, triggerKeyEvent, focus, blur, settled } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import AclStub from '../../stub-services/acl-stub';
import { issueQuerySchema } from '../../../helpers/query-schema';
import { parse } from 'prometheus/utils/query/parse';

const INPUT = '[data-ez-search-bar] input';

module('Integration | Component | ez-search/search-bar', function (hooks) {
    setupRenderingTest(hooks);

    hooks.beforeEach(async function () {
        this.owner.register('service:acl', AclStub);
        this.schema = issueQuerySchema();
        this.changes = [];
        this.runs = 0;
        this.tree = null;
        this.onChange = (tree) => {
            this.changes.push(tree);
            this.set('tree', tree);
        };
        this.onRun = () => (this.runs += 1);
        await render(hbs`<EzSearch::SearchBar @tree={{this.tree}} @schema={{this.schema}} @placeholder="Search" @onChange={{this.onChange}} @onRun={{this.onRun}} />`);
    });

    test('Enter parses, reports, runs and shows the exact format', async function (assert) {
        await focus(INPUT);
        await fillIn(INPUT, 'prio = hi status != done ');
        await triggerKeyEvent(INPUT, 'keydown', 'Escape');
        await triggerKeyEvent(INPUT, 'keydown', 'Enter');

        assert.strictEqual(this.changes.length, 1);
        assert.strictEqual(this.runs, 1);
        assert.dom(INPUT).hasValue('((Issue.priority : High) AND (Issue.status !: done))');
    });

    test('typing a field opens the menu and Tab inserts it', async function (assert) {
        await focus(INPUT);
        await fillIn(INPUT, 'prio');
        assert.dom('[data-ez-menu]').exists();
        assert.dom('[data-ez-menu] li.active').includesText('Priority');

        await triggerKeyEvent(INPUT, 'keydown', 'Tab');
        assert.dom(INPUT).hasValue('priority ');
    });

    test('arrow keys move and Esc closes the menu', async function (assert) {
        await focus(INPUT);
        await fillIn(INPUT, '');
        await triggerKeyEvent(INPUT, 'keydown', 'ArrowDown');
        assert.dom('[data-ez-menu] li.active').includesText('Priority');
        await triggerKeyEvent(INPUT, 'keydown', 'ArrowUp');
        assert.dom('[data-ez-menu] li.active').includesText('Subject');
        await triggerKeyEvent(INPUT, 'keydown', 'Escape');
        assert.dom('[data-ez-menu]').doesNotExist();
    });

    test('errors are shown and nothing is reported', async function (assert) {
        for (let text of ['status:zzz', 'status:new or type:bug milestone:v1']) {
            await focus(INPUT);
            await fillIn(INPUT, text);
            await triggerKeyEvent(INPUT, 'keydown', 'Escape');
            await triggerKeyEvent(INPUT, 'keydown', 'Enter');
            assert.dom('[data-ez-error]').exists();
            assert.dom(INPUT).hasValue(text);
        }

        assert.strictEqual(this.changes.length, 0);
        assert.strictEqual(this.runs, 0);
    });

    test('blur parses and reports without running', async function (assert) {
        await focus(INPUT);
        await fillIn(INPUT, 'priority:high');
        await blur(INPUT);

        assert.strictEqual(this.changes.length, 1);
        assert.strictEqual(this.runs, 0);
        assert.dom(INPUT).hasValue('((Issue.priority : High))');
    });

    test('an outside tree change updates the text', async function (assert) {
        this.set('tree', parse('status:done', this.schema).tree);
        await settled();

        assert.dom(INPUT).hasValue('((Issue.status : done))');
    });

    test('coloured tokens are text, not HTML', async function (assert) {
        this.set('tree', parse('status:done', this.schema).tree);
        await settled();

        assert.dom('[data-ez-query-text] .token-field').exists();
        assert.dom('[data-ez-query-text] .token-operator').exists();

        this.set('tree', parse('"<b>x</b>"', this.schema).tree);
        await settled();
        assert.dom('[data-ez-query-text] b').doesNotExist();
    });
});
