/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import App from "prometheus/routes/app";

/**
 * The module route, it is loaded when a user tried to navigate to the route
 * :wikiName e.g. acme.projects4.me/app/wiki/1/Home
 *
 * @class Page
 * @namespace Prometheus.Routes
 * @module App.Project.Wiki
 * @extends AppRoute
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default App.extend({

    /**
     * The wiki list, this list is retrieved by the app.wiki.project route but
     * since I do not want to send a network call to retrieve the same list again
     * I am making it accessible within the same route. This property is set by
     * the parent route.
     *
     * @property wikilist
     * @type Object
     * @for Page
     * @private
     */
    wikilist: {},

    /**
     * The setup controller function that will be called every time the user visits
     * the module route, this function is responsible for loading the required data
     * for the route
     *
     * @method setupController
     * @param {Prometheus.Controllers.Wiki} controller the controller object for this route
     * @private
     */
    setupController:function(controller){
        Logger.debug("Prometheus.Routes.App.Project.Wiki.Page::setupController");

        let params = this.getParams();

        this.project = this.store.findRecord('project',params.projectId,{rels:'none'});
        controller.set('projectId',params.projectId);

        let options = {
            query: '((Wiki.name : '+params.wikiName+') AND (Wiki.projectId : '+params.projectId+'))',
            sort : 'Wiki.name',
            order: 'ASC',
            limit: -1
        };

        this.data = this.store.query('wiki',options).then(function(data){
            let model = data.objectAt(0);
            controller.set('model',model);
            if (model !== undefined){

                let tags = model.get('tag');
                let tagCount = tags.get('length');
                let selectedTags = [];
                for(let i=0;i<tagCount;i++)
                {
                    selectedTags[i] = {label:tags.objectAt(i).get('tag'),value:tags.objectAt(i).get('id')};
                }
                controller.set('iVoted',model.get('vote').filterBy('createdUser',"1").length);
                controller.set('selectedTags',selectedTags);
                controller.set('parentId',model.get('parentId'));
            }
        });
        //controller.set('model',this.data);
        this.set('breadCrumb',{title:params.wikiName,record:true});
        controller.set('project',this.project);
    },

    /**
     * This function retrieves the route parameters, Most of the wiki functionality
     * is similar so we one write it once and extends it for different routes.
     * In order to make sure that we are able to retrieve the correct parameters we
     * have exposed this function.
     *
     * @method getParams
     * @return {Object} params The parameters for this route
     * @private
     */
    getParams:function(){
        let params = {};
        params['projectId'] = this.paramsFor('app.project').project_id;
        params['wikiName'] = this.paramsFor('app.project.wiki.page').wiki_name;
        return params;
    }

});