/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import _ from 'lodash';
import Component from '@glimmer/component';
import { service } from '@ember/service';

import { objectAt } from 'prometheus/utils/array/object-at';
import { toArray } from 'prometheus/utils/array/to-array';

/**
 * Bar colour of an issue whose spent time is within its estimate.
 *
 * @property WITHIN_ESTIMATE_COLOR
 * @type String
 * @final
 */
const WITHIN_ESTIMATE_COLOR = '#00a65a';

/**
 * Bar colour of an issue whose spent time reached or passed its estimate.
 *
 * @property OVER_ESTIMATE_COLOR
 * @type String
 * @final
 */
const OVER_ESTIMATE_COLOR = '#dd4b39';

/**
 * Renders the estimated vs spent chart of a project's issues. The chart is drawn by the render-chart
 * modifier, which redraws it when @issues changes.
 *
 * @class ChartEstimatedspent
 * @namespace Prometheus.Components
 * @extends Component
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default class ChartEstimatedspentComponent extends Component {

    /**
     * The intl library service that is used in order to get the translations
     *
     * @property intl
     * @type Ember.Service
     * @for ChartEstimatedspent
     * @private
     */
    @service intl;

    /**
     * The Chart.js configuration, or null when there are no issues to chart.
     *
     * @property chartConfig
     * @type Object
     * @for ChartEstimatedspent
     * @public
     */
    get chartConfig() {
        let issues = this.args.issues;
        if (issues === undefined || issues === null) {
            return null;
        }

        return {
            type: 'bar',
            data: this.getDatasets(issues),
            options: {
                responsive: true,
                maintainAspectRatio: false,
                layout: {
                    padding: {
                        bottom: 8
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            autoSkip: true,
                            maxRotation: 45,
                            minRotation: 0
                        }
                    },
                    y: {
                        min: 0,
                        max: 100,
                        ticks: {
                            callback: (value) => `${value}%`
                        }
                    }
                }
            }
        };
    }

    /**
     * Returns the total hours of a list of time entries ({ days, hours, minutes }).
     *
     * @method toHours
     * @param {Array} entries
     * @return {Number}
     * @private
     */
    toHours(entries) {
        if (entries === undefined) {
            return 0;
        }
        let hours = _.sum(entries.map((item) => item.days).map(Number)) * 24;
        hours += _.sum(entries.map((item) => item.hours).map(Number));
        hours += _.sum(entries.map((item) => item.minutes).map(Number)) / 60;
        return hours;
    }

    /**
     * Builds the chart data: one bar per issue with the spent share of its estimate (in %), plus the
     * efficiency line (the remaining share).
     *
     * @method getDatasets
     * @param {Object} issues
     * @return {{labels: Array, datasets: Array}}
     * @public
     */
    getDatasets(issues) {
        let data = {
            labels: [],
            datasets: [{
                label: this.intl.t('views.app.project.detail.charts.estimatedspent'),
                data: [],
                backgroundColor: [],
                type: 'bar',
                borderWidth: 0
            },
            {
                label: this.intl.t('views.app.project.detail.charts.efficiency'),
                type: 'line',
                data: [],
                backgroundColor: 'rgba(220,220,220,0)',
                borderColor: 'rgba(220,20,20,0.8)',
            }]
        };

        let issuesCount = issues.length;
        for (let i = 0; i < issuesCount; i++) {
            let issue = objectAt(issues, i);
            let estimatedHours = this.toHours(toArray(issue.get('estimated')));
            let spentHours = this.toHours(toArray(issue.get('spent')));

            data.labels[i] = '#' + issue.get('issueNumber');

            let spentVsEstimatedPercentage = 0;
            if (estimatedHours > 0) {
                spentVsEstimatedPercentage = _.round((spentHours / estimatedHours) * 100);
            }

            // Protect chart scale from invalid values (NaN/Infinity) when estimates are missing.
            if (!Number.isFinite(spentVsEstimatedPercentage)) {
                spentVsEstimatedPercentage = 0;
            }

            spentVsEstimatedPercentage = _.clamp(spentVsEstimatedPercentage, 0, 100);
            data.datasets[0].data[i] = spentVsEstimatedPercentage;
            data.datasets[1].data[i] = spentVsEstimatedPercentage === 0
                ? 0
                : _.clamp(100 - spentVsEstimatedPercentage, 0, 100);
            data.datasets[0].backgroundColor[i] = estimatedHours > spentHours
                ? WITHIN_ESTIMATE_COLOR
                : OVER_ESTIMATE_COLOR;
        }

        return data;
    }
}
