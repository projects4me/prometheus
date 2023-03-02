/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */
import Modifier from 'ember-modifier';

/**
 * This modifier is called on the initialization of OpenClosedChart component. In this we attach
 * customized doughnut chart to canvas.
 *
 * @example
 *  <canvas id="chart-open-close" {{initialize-doughnut-chart data=this.data}}>
 *  </canvas>
 * 
 * @class InitializeDoughnutChartModifier
 * @namespace Prometheus.Modifiers
 * @extends Modifier
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class InitializeDoughnutChartModifier extends Modifier {

    /**
     * This function returns data that is used to populate the chart.
     *
     * @method get
     * @return Array
     * @public
     */
    get data() {
        return this.args.named.data;
    }

    /** Called when the modifier is installed on the DOM element */
    didInstall() {
        this.initializeChart();
    }

    /**Called when the arguments provided to modifier are updated */
    didUpdateArguments() {
        this.chart.destroy();
        this.initializeChart();
    }

    /**
     * This function is used to initialize chart.
     * 
     * @method initializeChart
     * @public
     */
    initializeChart() {
        let _self = this;
        _self.chart = new Chart(_self.element, {
            type: 'customizedDoughnut',
            data: _self.data,
            options: {
                responsive: true,
                layout: {
                    padding: 30
                },
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    /** Called when user routed to another page. In this function we're destroying chart*/
    willDestroy() {
        this.chart.destroy();
    }
}
