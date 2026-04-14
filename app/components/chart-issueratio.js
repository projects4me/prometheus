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
     * This function is called when the object is created, we are using this
     * function to translate the emojis
     *
     * @method init
     * @private
     */
    init:function() {
        this._super(...arguments);
    },

    /**
     * This function is called after the component has been rendered, this is where
     * we initiate the chart
     *
     * @method didRender
     * @private
     */
    didRender:function() {
        var self = this;
        var issues = this.issues;

        var chartel = self.get('issueratio');
        if (chartel !== undefined) {
            chartel.destroy();
        }


        if (issues !== undefined) {
            var issueratio = new Chart(self.get('element'),{
                type: 'polarArea',
                data: self.getDatasets(issues),
                options: {
                }
            });

            self.set('issueratio',issueratio);
        }
    },

    /**
     * This function used to retrieve the data for the chart library
     *
     * @method getDatasets
     * @param {Object} issues
     * @return {{labels: Array, datasets: [*]}}
     * @private
     */
    getDatasets:function(issues) {
        let _self = this;
        let intl = _self.intl;
        let data = {
            labels:[],
            datasets:[{
                data:[],
                backgroundColor: [],
                borderColor: [],
                borderWidth: 1
            }]
        };
        const excludedStatuses = ['done', 'deferred', 'wont_fix'];
        let statuses = _.uniqBy(issues.getEach('status')).filter(status => !excludedStatuses.includes(status));
        let count = 0;
        let ch = new ColorHash();

        _.forEach(statuses,function(status) {
            data.labels[count] = intl.t("views.app.issue.lists.status."+status);
            data.datasets[0].data[count] = issues.filterBy('status',status).length;

            let rgba;
            if (STATUS_COLORS[status]) {
                rgba = hexToRgba(STATUS_COLORS[status], 1);
            } else {
                var color = ch.rgb(String(data.labels[count]));
                rgba = 'rgba('+color[0]+', '+color[1]+', '+color[2]+', 0.8)';
            }
            data.datasets[0].backgroundColor[count] = rgba;
            data.datasets[0].borderColor[count] = rgba;
            count++;
        });

        return data;
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
