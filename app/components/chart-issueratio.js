/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import _ from 'lodash';
import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { issueStatusLabel } from 'prometheus/utils/issue-status/label';

/**
 * Maps issue status keys to their app-wide hex colors, mirroring issue-status.scss.
 * Used to keep chart colors consistent with the rest of the application.
 *
 * @property STATUS_COLORS
 * @type Object
 * @final
 */
const STATUS_COLORS = {
    new: '#80b5d3',
    in_review: '#80b5d3',
    in_progress: '#B3244F',
    closed: '#e98a7e',
    pending: '#f7bf65',
    feedback: '#f7bf65',
    complete: '#5ac594',
};

/**
 * Status slices hidden by default. They remain available via legend toggle.
 *
 * @property DEFAULT_HIDDEN_STATUSES
 * @type Array
 * @final
 */
const DEFAULT_HIDDEN_STATUSES = ['done', 'deferred', 'wont_fix'];

/**
 * Opacity used for all chart slices.
 *
 * @property SLICE_ALPHA
 * @type Number
 * @final
 */
const SLICE_ALPHA = 0.8;

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
 * Renders the issue ratio (issues per status) polar area chart. The chart is drawn by the render-chart
 * modifier, which redraws it when @issues changes.
 *
 * @class ChartIssueratio
 * @namespace Prometheus.Components
 * @extends Component
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default class ChartIssueratioComponent extends Component {

    /**
     * The intl library service that is used in order to get the translations
     *
     * @property intl
     * @type Ember.Service
     * @for ChartIssueratio
     * @private
     */
    @service intl;

    /**
     * The distinct statuses of the issues, in the order of the chart slices.
     *
     * @property statusOrder
     * @type Array
     * @for ChartIssueratio
     * @public
     */
    get statusOrder() {
        let issues = this.args.issues;
        if (issues === undefined || issues === null) {
            return [];
        }
        return _.uniq(issues.map((item) => item.status));
    }

    /**
     * The Chart.js configuration, or null when there are no issues to chart.
     *
     * @property chartConfig
     * @type Object
     * @for ChartIssueratio
     * @public
     */
    get chartConfig() {
        let issues = this.args.issues;
        if (issues === undefined || issues === null) {
            return null;
        }

        return {
            type: 'polarArea',
            data: this.buildChartData(issues, this.statusOrder),
            options: {
                plugins: {
                    legend: {
                        display: true,
                    },
                },
            },
        };
    }

    /**
     * Builds Chart.js polarArea data, one slice per status (same index as statusOrder).
     *
     * @method buildChartData
     * @param {Object} issues Ember collection of issues
     * @param {Array} statusOrder the distinct statuses of the issues
     * @return {{ labels: string[], datasets: Object[] }}
     * @private
     */
    buildChartData(issues, statusOrder) {
        let colorHash = new ColorHash();
        let labels = [];
        let values = [];
        let colors = [];

        statusOrder.forEach((statusKey) => {
            let translatedLabel = issueStatusLabel(this.intl, statusKey);
            let rgba;
            if (STATUS_COLORS[statusKey]) {
                rgba = hexToRgba(STATUS_COLORS[statusKey], SLICE_ALPHA);
            } else {
                let rgb = colorHash.rgb(String(translatedLabel));
                rgba = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${SLICE_ALPHA})`;
            }

            labels.push(translatedLabel);
            values.push(issues.filter((item) => item.status === statusKey).length);
            colors.push(rgba);
        });

        return {
            labels,
            datasets: [{
                data: values,
                backgroundColor: colors,
                borderColor: [...colors],
                borderWidth: 1,
            }],
        };
    }

    /**
     * Hides the default-hidden status slices once the chart is drawn; the legend can show them again.
     *
     * @method hideDefaultStatuses
     * @param {Object} chart
     * @public
     */
    @action
    hideDefaultStatuses(chart) {
        let statusOrder = this.statusOrder;
        if (!chart || !statusOrder.length) {
            return;
        }
        statusOrder.forEach((statusKey, index) => {
            if (DEFAULT_HIDDEN_STATUSES.includes(statusKey)) {
                chart.toggleDataVisibility(index);
            }
        });
        chart.update();
    }
}
