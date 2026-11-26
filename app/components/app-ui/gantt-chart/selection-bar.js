/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { conflictingBlockers } from 'prometheus/utils/gantt/conflicts';

/**
 * The phone bar at the bottom of the Gantt panel: the selected issue (#number and subject), its link counts and
 * the actions Edit dates, Link and Details.
 *
 * @class AppUiGanttChartSelectionBarComponent
 * @namespace Prometheus.Components
 * @extends Glimmer.Component
 *
 * @example
 * <AppUi::GanttChart::SelectionBar @issue={{this.issue}} @links={{this.links}} @onEdit={{this.edit}}
 *   @onLink={{this.link}} @onDetails={{this.details}} @onClose={{this.close}} />
 */
export default class AppUiGanttChartSelectionBarComponent extends Component {
    /**
     * The link counts of the issue: `{ conflict, blockedBy, blocks, relates }`.
     *
     * @property counts
     * @type Object
     * @public
     */
    get counts() {
        const lookup = this.args.links;
        const id = this.args.issue?.id;
        if (!lookup || id === undefined || id === null) {
            return { conflict: 0, blockedBy: 0, blocks: 0, relates: 0 };
        }
        return {
            conflict: conflictingBlockers(this.args.issue, lookup).length,
            blockedBy: lookup.blockedBy(id).length,
            blocks: lookup.blocks(id).length,
            relates: lookup.relates(id).length
        };
    }
}
