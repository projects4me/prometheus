/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';

/**
 * This component is used to render open close projects/issues chart.
 *
 * @class ChartsOpenClosedChartComponent
 * @namespace Prometheus.Components
 * @extends Ember.Component
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class ChartsOpenClosedChartComponent extends Component {

    /**
     * This function prepare and returns the data that will be used to populate
     * the chart.
     *
     * @method get
     * @public
     */
    get data() {
        let closed = Number(this.args.closedCount ?? 0);
        let open = Number(this.args.openCount ?? 0);
        let labels = ['closed', 'open'];
        let colors = ['#508874', '#A2EDD2'];
        let bothZero = closed === 0 && open === 0;

        let segmentValues = bothZero ? [1, 1] : [closed, open];

        return {
            labels,
            datasets: [{
                data: segmentValues,
                backgroundColor: colors,
                ...(bothZero ? { displayValues: [0, 0] } : {}),
            }],
        };
    }
}
