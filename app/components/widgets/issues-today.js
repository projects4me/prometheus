/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Widget from "./widgets";
import { inject } from '@ember/service';
import _ from "lodash";
import $ from 'jquery';

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
export default Widget.extend({

    /**
     * The i18n Service
     *
     * @property i18n
     * @type Prometheus.Services.i18n
     * @for IssuesToday
     * @private
     */
    i18n: inject(),

    /**
     * The i18n Service
     *
     * @property router
     * @type Prometheus.Services.i18n
     * @for IssuesToday
     * @private
     */
    router: inject(),

    /**
     * This function is called after the HTML elements have been
     * inserted in the DOM
     *
     * @method didInsertElement
     * @protected
     */
    didInsertElement(){
        Logger.debug(this._super());

        let _self = this;
        let data = _self.get('data');
        let dataSet = [];
        let i18n = _self.get('i18n');

        data.forEach(function(issue){
            dataSet.push([
                '<a href="javascript:void(0);">'+issue.get('issueNumber')+'</a>',
                '<a href="javascript:void(0);">'+issue.get('subject')+'</a>',
                '<span class="badge '+issue.get('status')+'">'+i18n.t("views.app.issue.lists.status."+issue.get('status'))+'</span>',
                moment(issue.get('startDate') ,'YYYY-MM-DD').format('MMM Do YY'),
                moment(issue.get('endDate') ,'YYYY-MM-DD').format('MMM Do YY'),
                issue.get('project.name'),
                issue.get('projectId')
            ])
        });

        let table = $('#'+this.elementId+' table').DataTable({
            data: dataSet,
            select: true,
            columns: [
                { title: "#" },
                { title: "Subject" },
                { title: "Status" },
                { title: "Start date" },
                { title: "End data" },
                { title: "Project" },
                { title: "projectId" }
            ],
            columnDefs: [
                {
                    targets: [ 6 ],
                    visible: false,
                    searchable: false
                }
            ]
        });

        table.on( 'select', function ( e, dt, type, indexes ) {
            if ( type === 'row' ) {
                let issueNumber = table.rows( indexes ).data().pluck(0)[0];
                let projectId = table.rows( indexes ).data().pluck(6)[0];

                issueNumber = _.replace(issueNumber,'<a href="javascript:void(0);">','');
                issueNumber = _.replace(issueNumber,'</a>','');
                _self.get('router').transitionTo('app.project', {project_id:projectId});
                _self.get('router').transitionTo('app.project.issue.page', {project_id:projectId,issue_number:issueNumber});
            }
        } );
    }
});
