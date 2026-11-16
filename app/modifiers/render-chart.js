/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */
import Modifier from 'ember-modifier';
import { registerDestructor } from '@ember/destroyable';

/**
 * Draws a Chart.js chart on a canvas from a chart configuration ({ type, data, options }). The chart is
 * redrawn whenever the configuration changes and destroyed when the element is torn down. A missing
 * configuration leaves the canvas empty.
 *
 * @example
 *  <canvas {{render-chart this.chartConfig onCreate=this.afterCreate}}></canvas>
 *
 * @class RenderChartModifier
 * @namespace Prometheus.Modifiers
 * @extends Modifier
 */
export default class RenderChartModifier extends Modifier {

    /**
     * The chart drawn on the element, if any
     *
     * @property chart
     * @type Chart
     * @private
     */
    chart = null;

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
     * Draws the chart on install and redraws it when the configuration changes.
     *
     * @method modify
     * @param {HTMLCanvasElement} element
     * @param {Array} positional [config] the Chart.js configuration
     * @param {Object} named onCreate: called with the new chart after it is drawn
     * @public
     */
    modify(element, [config], { onCreate }) {
        this.destroyChart();
        if (!config) {
            return;
        }
        this.chart = new Chart(element, config);
        if (typeof onCreate === 'function') {
            onCreate(this.chart);
        }
    }

    /**
     * Destroys the chart, if one is drawn.
     *
     * @method destroyChart
     * @private
     */
    destroyChart() {
        if (this.chart) {
            this.chart.destroy();
            this.chart = null;
        }
    }
}
