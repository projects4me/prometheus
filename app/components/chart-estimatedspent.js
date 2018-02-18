/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import _ from "lodash";
import Component from '@ember/component';
import { inject } from '@ember/service';

/**
 * This component is used to render the issue ratio chart in the application
 *
 * @class ChartEstimatedspent
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
    classNames: ["chart-estimatedspent"],

    /**
     * These are the attributes that are bound with the element
     *
     * @property attributeBindings
     * @type Array
     * @for ChartIssueratio
     * @private
     */
    attributeBindings: ["width","height"],

    /**
     * The tag name of this component
     *
     * @property tagName
     * @type Bool
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
    init(){
        this._super(...arguments);
    },

    /**
     * This function is called after the component has been rendered, this is where
     * we initiate the chart
     *
     * @method didRender
     * @private
     */
    didRender(){
        let self = this;
        let issues = this.get('issues');
        let chartel = self.get('estimatedspent');
        if (chartel !== undefined) {
            chartel.destroy();
        }

        if (issues !== undefined){
            var estimatedspent = new Chart(self.get('element'),{
                type:"bar",
                data: self.getDatasets(issues),
                options: {}
            });
            self.set('estimatedspent',estimatedspent);
        }
    },

    /**
     * This function is used in order to retrive the data set for the charting library to use.
     *
     * @method getDatasets
     * @param {Object} issues
     * @return {{labels: Array, datasets: [*,*]}}
     */
    getDatasets(issues){
        //var self = this;
        let data = {
            labels:[],
            datasets:[{
                label: this.get('i18n').t("view.app.project.detail.charts.estimatedspent"),
                data:[],
                backgroundColor: [],
                type: 'bar',
                borderWidth: 0
            },
                {
                    label: this.get('i18n').t("view.app.project.detail.charts.efficiency"),
                    type: "line",
                    data:[],
                    backgroundColor: "rgba(220,220,220,0)",
                    borderColor: "rgba(220,20,20,0.8)",
                }
            ]};

        let issuesCount = issues.get('length');
        let estimated = null;
        let spent = null;
        let estimatedHours = 0;
        let spentHours = 0;
        let issue = null;

        for (let i=0; i<issuesCount;i++)
        {
            issue = issues.nextObject(i);
            estimated = issue.get('estimated');
            spent = issue.get('spent');
            estimatedHours = 0;
            if (estimated !== undefined)
            {
                estimatedHours = _.sum(estimated.getEach('days').map(Number)) * 24;
                estimatedHours += _.sum(estimated.getEach('hours').map(Number));
                estimatedHours += _.sum(estimated.getEach('minutes').map(Number)) / 60;
            }

            spentHours = 0;
            if(spent !== undefined)
            {
                spentHours = _.sum(spent.getEach('days').map(Number)) * 24;
                spentHours += _.sum(spent.getEach('hours').map(Number));
                spentHours += _.sum(spent.getEach('minutes').map(Number)) / 60;
            }

            data.labels[i] = "#"+issue.get('issueNumber');

            data.datasets[0]['data'][i] = _.round((spentHours/estimatedHours) * 100);

            data.datasets[1]['data'][i] = (100 - data.datasets[0]['data'][i]);
            if (data.datasets[0]['data'][i] === undefined || data.datasets[0]['data'][i] === 0)
            {
                data.datasets[1]['data'][i] = 0;
            }

            data.datasets[0]['backgroundColor'][i] = '#dd4b39';
            if (estimatedHours > spentHours) {
                data.datasets[0]['backgroundColor'][i] = '#00a65a';
            }

        }

        return data;
    },

    /**
     * This function is called after the elements drawn by ember js needs to be deleted, we destroy the chart
     *
     * @method willDestroyElement
     * @private
     */
    willDestroyElement(){
        Logger.debug('ChartEstimatedspentComponent::willDestroyElement()');
        if (this.get('estimatedspent') !== undefined) {
            this.get('estimatedspent').destroy();
        }
    },

    /**
     * This function is called after the view rendered must be cleared
     *
     * @method
     * @private
     */
    willClearRender(){
        Logger.debug('ChartEstimatedspentComponent::willDestroyElement()');
        if (this.get('estimatedspent') !== undefined) {
            this.get('estimatedspent').destroy();
        }
    },

});
