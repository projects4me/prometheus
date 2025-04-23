/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Page from "prometheus/routes/app/project/wiki/page";

/**
 * The wiki's edit page route. This route retrieves the information and displays
 * it across.
 *
 * @class Edit
 * @namespace Prometheus.Routes
 * @module App.Project.Wiki
 * @extends Page
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default Page.extend({

    setupController(controller){
        this._super(controller);
        let newTag = this.store.createRecord('tag',{});
        controller.set('newTag', newTag);
    },

    /**
     * These are the events that are handled by this route
     *
     * @property action
     * @type Object
     * @for Edit
     * @public
     */
    action:{

        /**
         * This function is used to navigate the user the the page route on save
         *
         * @method redirectOnSave
         * @param routeParams
         * @public
         */
        redirectOnSave:function(routeParams){
            this.refresh();
            this.transitionTo('app.project.wiki.page',routeParams);
        }

    }

});