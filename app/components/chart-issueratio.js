/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import _ from "lodash";
import Component from '@ember/component';
import { inject } from '@ember/service';

/**
 * Maps issue status keys to their app-wide hex colors, mirroring issue-status.scss.
 * Used to keep chart colors consistent with the rest of the application.
 */
const STATUS_COLORS = {
    new:        '#80b5d3',
    in_review:  '#80b5d3',
    in_progress:'#B3244F',
    closed:     '#e98a7e',
    pending:    '#f7bf65',
    feedback:   '#f7bf65',
    complete:   '#5ac594',
};

/**
 * Converts a hex color string to an rgba() string with the given alpha.
 *
 * @param {String} hex   e.g. '#B3244F'
 * @param {Number} alpha e.g. 0.8
 * @return {String}      e.g. 'rgba(179, 36, 79, 0.8)'
 */
function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * This component is used to render the issue ratio chart in the application
 *
 * @class ChartIssueratio
 * @namespace Prometheus.Components
 * @extends Ember.Component
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default Component.extend({

    /**
     * The intl library service that is used in order to get the translations
     *
     * @property intl
     * @type Ember.Service
     * @for ChartIssueratio
     * @private
     */
    intl: inject(),

    /**
     * Status slices hidden by default. They remain available via legend toggle.
     *
     * @property defaultHiddenStatuses
     * @type {Array}
     * @private
     */
    defaultHiddenStatuses: ['done', 'deferred', 'wont_fix'],

    /**
     * Opacity used for all chart slices.
     *
     * @property sliceAlpha
     * @type {Number}
     * @private
     */
    sliceAlpha: 0.8,

    /**
     * Maps issue status keys to app-wide colors from issue-status.scss.
     *
     * @property statusColorMap
     * @type {Object}
     * @private
     */
    statusColorMap: {
        new: '#80b5d3',
        in_review: '#80b5d3',
        in_progress: '#B3244F',
        closed: '#e98a7e',
        pending: '#f7bf65',
        feedback: '#f7bf65',
        complete: '#5ac594',
    },

    /**
     * These are the classes the must be registered with the component
     *
     * @property classNames
     * @type Array
     * @for ChartIssueratio
     * @private
     */
    classNames: ["chart-issueratio"],

    /**
     * The tag name of this component
     *
     * @property tagName
     * @type String
     * @for ChartIssueratio
     * @private
     */
    tagName: 'canvas',

    /**
     * This function is called after the component has been rendered, this is where
     * we initiate the chart
     *
     * @method didRender
     * @private
     */
    didRender:function() {
        let issues = this.issues;

        let existingChart = this.get('issueratio');
        if (existingChart !== undefined) {
            existingChart.destroy();
        }

        if (issues === undefined) {
            return;
        }

        let { labels, datasets, statusOrder } = this.buildChartData(issues);
        let chart = new Chart(this.get('element'), {
            type: 'polarArea',
            data: {
                labels,
                datasets,
            },
            options: {
                plugins: {
                    legend: {
                        display: true,
                    },
                },
            },
        });

        this.hideDefaultStatuses(chart, statusOrder);
        this.set('issueratio', chart);
    },

    /**
     * Converts a hex color string to rgba with the provided alpha.
     *
     * @method hexToRgba
     * @param {string} hex
     * @param {number} alpha
     * @return {string}
     * @private
     */
    hexToRgba(hex, alpha) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    },

    /**
     * Applies default visibility for status slices after chart creation.
     *
     * @method hideDefaultStatuses
     * @param {Object} chart
     * @param {Array} statusOrder
     * @private
     */
    hideDefaultStatuses(chart, statusOrder) {
        if (!chart || !statusOrder?.length) {
            return;
        }
        statusOrder.forEach((statusKey, index) => {
            if (this.defaultHiddenStatuses.includes(statusKey)) {
                chart.toggleDataVisibility(index);
            }
        });
        chart.update();
    },

    /**
     * Builds Chart.js polarArea data plus a parallel status-key array (same index as labels/data)
     * for default slice visibility. Does not filter statuses out of the dataset.
     *
     * @method buildChartData
     * @param {Object} issues Ember collection of issues
     * @return {{ labels: string[], datasets: Object[], statusOrder: string[] }}
     * @private
     */
    buildChartData(issues) {
        let colorHash = new ColorHash();
        let statuses = _.uniqBy(issues.getEach('status'));

        let labels = [];
        let statusOrder = [];
        let values = [];
        let backgroundColors = [];
        let borderColors = [];

        _.forEach(statuses, (statusKey) => {
            let translatedLabel = this.intl.t('views.app.issue.lists.status.' + statusKey);
            let count = issues.filterBy('status', statusKey).length;
            let rgba;
            if (this.statusColorMap[statusKey]) {
                rgba = this.hexToRgba(this.statusColorMap[statusKey], this.sliceAlpha);
            } else {
                let rgb = colorHash.rgb(String(translatedLabel));
                rgba = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${this.sliceAlpha})`;
            }

            statusOrder.push(statusKey);
            labels.push(translatedLabel);
            values.push(count);
            backgroundColors.push(rgba);
            borderColors.push(rgba);
        });

        return {
            labels,
            statusOrder,
            datasets: [{
                data: values,
                backgroundColor: backgroundColors,
                borderColor: borderColors,
                borderWidth: 1,
            }],
        };
    },

    /**
     * This function is called Ember is destroying the HTML elements rendered, we destroy the object for the chart
     *
     * @method willDestroElement
     * @private
     */
    willDestroyElement:function() {
        if (this.issueratio !== undefined) {
            this.issueratio.destroy();
        }
    }

});
