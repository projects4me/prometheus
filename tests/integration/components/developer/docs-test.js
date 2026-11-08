import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, settled } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | developer/docs', function (hooks) {
    setupRenderingTest(hooks);

    let original;
    hooks.beforeEach(function () {
        original = window.fetch;
    });
    hooks.afterEach(function () {
        window.fetch = original;
    });

    let stub = (status, body, type = 'text/markdown') => {
        window.fetch = async () => ({
            ok: status >= 200 && status < 300,
            status,
            headers: { get: () => type },
            text: async () => body
        });
    };

    test('it shows the sections as tabs', async function (assert) {
        stub(200, 'intro\n## Overview\nFirst text\n## Arguments\nSecond text');
        await render(hbs`<Developer::Docs @doc="x.md" />`);
        await settled();

        assert.dom('[data-docs-tab]').exists({ count: 2 });
        assert.dom('li.active [data-docs-tab]').hasText('Overview');
        assert.dom('[data-docs-content]').includesText('First text');
        await click('[data-docs-tab="Arguments"]');
        assert.dom('li.active [data-docs-tab]').hasText('Arguments');
        assert.dom('[data-docs-content]').includesText('Second text');
    });

    test('it shows the missing state', async function (assert) {
        stub(404, '');
        await render(hbs`<Developer::Docs @doc="x.md" />`);
        await settled();

        assert.dom('[data-docs-missing]').includesText('/ui-docs/x.md');
    });

    test('it shows the error state', async function (assert) {
        window.fetch = async () => {
            throw new Error('offline');
        };
        await render(hbs`<Developer::Docs @doc="x.md" />`);
        await settled();

        assert.dom('[data-docs-error]').exists();
    });

    test('it treats an html page as missing', async function (assert) {
        stub(200, '<html></html>', 'text/html; charset=utf-8');
        await render(hbs`<Developer::Docs @doc="x.md" />`);
        await settled();

        assert.dom('[data-docs-missing]').exists();
    });

    test('it shows the error state on a 500', async function (assert) {
        stub(500, '');
        await render(hbs`<Developer::Docs @doc="x.md" />`);
        await settled();

        assert.dom('[data-docs-error]').exists();
    });

    test('it ignores headings inside code fences', async function (assert) {
        stub(200, ['## Overview', '```', '## not a tab', '```', '## Arguments', 'x'].join('\n'));
        await render(hbs`<Developer::Docs @doc="x.md" />`);
        await settled();

        assert.dom('[data-docs-tab]').exists({ count: 2 });
    });
});
