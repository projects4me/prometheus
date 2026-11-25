/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled } from '@ember/test-helpers';
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
});
