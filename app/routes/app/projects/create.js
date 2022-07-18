/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import App from "prometheus/routes/app";
import { hash } from 'rsvp';
import Format from "prometheus/utils/data/format";

/**
 *  This is the route that will handle the creation of new issues
 *
 *  @class Create
 *  @namespace Prometheus.Routes
 *  @module App.Project.Issue
 *  @extends App
 *  @author Hammad Hassan <gollomer@gamil.com>
 */
export default App.extend({

    /**
     * This function returns returns the project being created
     * and the issue types available in the system
     *
     * @method afterModel
     * @
     */
    afterModel(){
        let _self = this;

        let issuetypeOptions = {
            query: '(Issuetype.system : 1)',
            limit: -1
        };

        let issueStatusOptions= {
            query : '(Issuestatus.system : 1)',
            limit: -1
        }

        return hash({
            project: _self.get('store').createRecord('project',{
                assignee: _self.get('currentUser').user.id
            }),
            issuetypes: _self.store.query('issuetype',issuetypeOptions),
            issueStatuses: _self.store.query('issuestatus', issueStatusOptions)
        }).then(function(results){
            _self.set('project',results.project);
            _self.set('issuetypes',results.issuetypes.toArray());
            _self.set('issueStatuses',results.issueStatuses);
        });

    },

    /**
     * This function is called every time the controller is being setup
     *
     * @method setupController
     * @param {Prometheus.Controllers.Issue} controller
     * @protected
     * @todo Store static lists elsewhere
     */
    setupController:function(controller)
    {
        Logger.debug('AppProjectIndexRoute::setupController');
        let _self = this;

        controller.set('model',_self.get('project'));
        controller.set('issuetypes',_self.get('issuetypes'));
        controller.set('issueStatuses', _self.issueStatuses);

        let format = new Format(this);
        let type = format.getList('views.app.project.lists.type');
        let status = format.getList('views.app.project.lists.status');
        
        controller.set('type',type);
        controller.set('status', status);
    },

});
