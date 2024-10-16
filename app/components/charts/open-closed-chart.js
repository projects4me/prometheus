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
        let _self = this;
        let labels =['closed', 'open'];
        let colors = ['#508874', '#A2EDD2']
        let data = {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: []
            }],
        }
        let counts = [_self.args.closedCount ?? '0', _self.args.openCount ?? '0'];

        counts.forEach((count, i) =>{
            data.labels.push(labels[i]);
            data.datasets[0].data.push(count);
            data.datasets[0].backgroundColor.push(colors[i]);
        })
        return data;
    }
}
