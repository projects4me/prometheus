/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */
import Modifier from 'ember-modifier';
import { registerDestructor } from '@ember/destroyable';

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
        return this.named.data;
    }

    /**
     * Destroys the chart when the modifier is torn down.
     *
     * @method constructor
     * @param {Object} owner
     * @param {Object} args
     */
    constructor(owner, args) {
        super(owner, args);
        registerDestructor(this, () => this.destroyChart());
    }

    /**
     * Draws the chart on install and redraws it when the arguments change.
     *
     * @method modify
     * @param {Element} element
     * @param {Array} positional
     * @param {Object} named
     * @public
     */
    modify(element, positional, named) {
        this.element = element;
        this.named = named;
        this.destroyChart();
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
                    padding: 20
                },
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label(context) {
                                let dataset = context.dataset;
                                let displayVals = dataset.displayValues;
                                let value = (displayVals && displayVals[context.dataIndex] !== undefined)
                                    ? displayVals[context.dataIndex]
                                    : context.parsed;
                                let label = context.label || '';
                                return label ? `${label}: ${value}` : `${value}`;
                            },
                        },
                    },
                }
            }
        });
    }

    /**
     * This function is used to destroy chart, if rendered.
     * 
     * @method destroyChart
     * @public
     */
    destroyChart() {
        (this.chart instanceof Chart) && (this.chart.destroy());
    }
}
