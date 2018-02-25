/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import _ from "lodash";
import Component from '@ember/component';
import { inject } from '@ember/service';

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
     * The i18n library service that is used in order to get the translations
     *
     * @property i18n
     * @type Ember.Service
     * @for ChartIssueratio
     * @private
     */
    i18n: inject(),

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
        var issues = this.get('issues');

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
        var self = this;
        var data = {
            labels:[],
            datasets:[{
                data:[],
                backgroundColor: [],
                borderColor: [],
                borderWidth: 1
            }]
        };
        var statuses = _.uniqBy(issues.getEach('status'));
        var count = 0;
        var ch = new ColorHash();

        _.forEach(statuses,function(status) {
            data.labels[count] = self.get('i18n').t("views.app.issue.lists.status."+status).string;
            data.datasets[0].data[count] = issues.filterBy('status',status).length;

            var color = ch.rgb(data.labels[count]);
            data.datasets[0].backgroundColor[count] = 'rgba('+color[0]+', '+color[1]+', '+color[2]+', 0.8)';
            data.datasets[0].borderColor[count] = 'rgba('+color[0]+', '+color[1]+', '+color[2]+', 0.8)';
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
        if (this.get('issueratio') !== undefined) {
            this.get('issueratio').destroy();
        }
    }

});
