/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
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
});
