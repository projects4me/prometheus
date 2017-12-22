/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Ember from "ember";
import issue from "../../models/issue";

/**
 * This class adds the functionality of dropdown action menu in the system
 * In order to allow capturing of an event of any specified name we are passing
 * all incoming actions over to the controller.
 *
 * @class IssuesToday
 * @namespace Prometheus.Components.Widgets
 * @extends Ember.Component
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default Ember.Component.extend({

    /**
     * The i18n Service
     *
     * @property i18n
     * @type Prometheus.Services.i18n
     * @for IssuesToday
     * @private
     */
    i18n: Ember.inject.service(),

    /**
     * The i18n Service
     *
     * @property router
     * @type Prometheus.Services.i18n
     * @for IssuesToday
     * @private
     */
    router: Ember.inject.service(),

    /**
     * This function is called after the HTML elements have been
     * inserted in the DOM
     *
     * @method didInsertElement
     * @protected
     */
    didInsertElement(){
        let _self = this;
        let data = _self.get('data');
        let dataSet = [];
        let i18n = _self.get('i18n');

        data.forEach(function(issue){
            dataSet.push([
                '<a href="javascript:void(0);">'+issue.get('issueNumber')+'</a>',
                '<a href="javascript:void(0);">'+issue.get('subject')+'</a>',
                i18n.t("view.app.issue.lists.status."+issue.get('status')),
                moment(issue.get('startDate') ,'YYYY-MM-DD').format('MMM Do YY'),
                moment(issue.get('endDate') ,'YYYY-MM-DD').format('MMM Do YY'),
                issue.get('project.name'),
            ])
        });

        let table = Ember.$('#'+this.elementId+' table').DataTable({
            data: dataSet,
            select: true,
            columns: [
                { title: "#" },
                { title: "Subject" },
                { title: "Status" },
                { title: "Start date" },
                { title: "End data" },
                { title: "Project" }
            ]
        });

        table.on( 'select', function ( e, dt, type, indexes ) {
            if ( type === 'row' ) {
                let issueNumber = table.rows( indexes ).data().pluck(0)[0];
                issueNumber = _.replace(issueNumber,'<a href="javascript:void(0);">','');
                issueNumber = _.replace(issueNumber,'</a>','');
                _self.get('router').transitionTo('app.project.issue.page', {projectId:'645',issueNumber:issueNumber});
            }
        } );
    }
});
