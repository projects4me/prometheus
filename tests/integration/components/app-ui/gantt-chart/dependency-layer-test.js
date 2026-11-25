/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled, triggerEvent, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | app-ui/gantt-chart/dependency-layer', function (hooks) {
    setupRenderingTest(hooks);

    const bar = (left, top) => {
        const el = document.createElement('div');
        el.style.cssText = `position:absolute;left:${left}px;top:${top}px;width:60px;height:20px`;
        return el;
    };

    test('links of the selected issue get the selected class', async function (assert) {
        const body = document.createElement('div');
        body.style.cssText = 'position:relative;width:600px;height:300px';
        document.body.appendChild(body);
        const registry = { 1: bar(10, 10), 2: bar(200, 60), 3: bar(300, 110) };
        Object.values(registry).forEach((el) => body.appendChild(el));

        this.body = body;
        this.registry = registry;
        this.dependencies = [
            { fromIssueId: '1', toIssueId: '2' },
            { fromIssueId: '2', toIssueId: '3' },
            { fromIssueId: '1', toIssueId: '3' }
        ];

        await render(hbs`<AppUi::GanttChart::DependencyLayer
            @dependencies={{this.dependencies}}
            @barRegistry={{this.registry}}
            @timelineBodyElement={{this.body}}
            @selectedIssueId="2"
            @rowHeight={{45}}
        />`);

        const selected = [...this.element.querySelectorAll('.dependency-line.selected')].map(
            (el) => `${el.dataset.fromIssueId}-${el.dataset.toIssueId}`
        );
        assert.deepEqual(selected.sort(), ['1-2', '2-3']);
        assert.dom('.dependency-line:not(.selected)').exists({ count: 1 });
        body.remove();
    });

    test('each link type renders its class and relates only shows for the selected issue', async function (assert) {
        const body = document.createElement('div');
        body.style.cssText = 'position:relative;width:600px;height:300px';
        document.body.appendChild(body);
        const registry = { 1: bar(10, 10), 2: bar(200, 60), 3: bar(300, 110), 4: bar(400, 160) };
        Object.values(registry).forEach((el) => body.appendChild(el));

        this.body = body;
        this.registry = registry;
        this.dependencies = [
            { fromIssueId: '1', toIssueId: '2', type: 'blocks', conflict: false },
            { fromIssueId: '2', toIssueId: '3', type: 'blocks', conflict: true },
            { fromIssueId: '3', toIssueId: '4', type: 'splits' },
            { fromIssueId: '1', toIssueId: '4', type: 'relates' }
        ];
        this.selected = null;

        await render(hbs`<AppUi::GanttChart::DependencyLayer
            @dependencies={{this.dependencies}}
            @barRegistry={{this.registry}}
            @timelineBodyElement={{this.body}}
            @selectedIssueId={{this.selected}}
            @rowHeight={{45}}
        />`);

        assert.dom('.dependency-line-blocks').exists({ count: 2 });
        assert.dom('.dependency-line-blocks.conflict').exists({ count: 1 });
        assert.dom('.dependency-line-splits').exists({ count: 1 });
        assert.dom('.dependency-line-relates').doesNotExist();

        this.set('selected', '1');
        await settled();
        this.set('dependencies', [...this.dependencies]);
        await settled();
        assert.dom('.dependency-line-relates').exists({ count: 1 });
        assert.dom('.dependency-line-relates').doesNotHaveAttribute('marker-end');
        body.remove();
    });

    const setup = (context, dependencies, selected = null) => {
        const body = document.createElement('div');
        body.style.cssText = 'position:relative;width:600px;height:300px';
        document.body.appendChild(body);
        const registry = { 1: bar(10, 10), 2: bar(200, 60), 3: bar(300, 110) };
        Object.values(registry).forEach((el) => body.appendChild(el));
        context.setProperties({ body, registry, dependencies, selected });
        return body;
    };

    const template = hbs`<AppUi::GanttChart::DependencyLayer
        @dependencies={{this.dependencies}}
        @barRegistry={{this.registry}}
        @timelineBodyElement={{this.body}}
        @selectedIssueId={{this.selected}}
        @onDeleteDependency={{this.onDelete}}
        @rowHeight={{45}}
    />`;

    test('a blocks and a splits line between the same pair are both drawn on distinct paths', async function (assert) {
        const body = setup(this, [
            { fromIssueId: '1', toIssueId: '2', type: 'blocks' },
            { fromIssueId: '1', toIssueId: '2', type: 'splits' }
        ]);
        await render(template);
        const paths = [...this.element.querySelectorAll('.dependency-line')].map((el) => el.getAttribute('d'));
        assert.strictEqual(paths.length, 2);
        assert.notStrictEqual(paths[0], paths[1]);
        body.remove();
    });

    test('relates routes as an elbow without an arrowhead, blocks and splits keep theirs', async function (assert) {
        const body = setup(this, [
            { fromIssueId: '1', toIssueId: '2', type: 'blocks' },
            { fromIssueId: '1', toIssueId: '3', type: 'splits' },
            { fromIssueId: '2', toIssueId: '3', type: 'relates' }
        ], '2');
        await render(template);
        assert.dom('.dependency-line-relates').doesNotHaveAttribute('marker-end');
        assert.dom('.dependency-line-relates').hasAttribute('d', /^M [\d.]+ [\d.]+ H /);
        assert.dom('.dependency-line-blocks').hasAttribute('marker-end');
        assert.dom('.dependency-line-splits').hasAttribute('marker-end');
        body.remove();
    });

    test('selected links of every type keep their type class, a conflict stays red', async function (assert) {
        const body = setup(this, [
            { fromIssueId: '1', toIssueId: '2', type: 'blocks', conflict: true },
            { fromIssueId: '2', toIssueId: '3', type: 'splits' },
            { fromIssueId: '1', toIssueId: '3', type: 'relates' }
        ], '2');
        await render(template);
        assert.dom('.dependency-line-blocks.conflict.selected').exists();
        assert.dom('.dependency-line-splits.selected').exists();
        assert.dom('.dependency-line-blocks').hasAttribute('marker-end', 'url(#dependency-arrowhead-conflict)');
        assert.dom('.dependency-line-splits').hasAttribute('marker-end', 'url(#dependency-arrowhead-active)');
        assert.notStrictEqual(getComputedStyle(this.element.querySelector('.dependency-line-splits')).strokeDasharray, 'none', 'splits keeps its dashes');
        body.remove();
    });

    test('right-click Delete hands the link of the line to onDeleteDependency', async function (assert) {
        const link = { id: 'l1' };
        const body = setup(this, [{ fromIssueId: '1', toIssueId: '2', type: 'blocks', link }]);
        this.onDelete = (arg) => assert.step(arg === link ? 'link' : 'other');
        await render(template);
        await triggerEvent('.dependency-line', 'contextmenu', { clientX: 20, clientY: 20 });
        await click('.dependency-context-menu .context-menu-item');
        assert.verifySteps(['link']);
        body.remove();
    });
});
