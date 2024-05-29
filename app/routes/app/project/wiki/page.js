/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import App from "prometheus/routes/app";
import { inject } from '@ember/service';

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
     * The trackedProject service provides id of the selected project.
     *
     * @property trackedProject
     * @type Ember.Service
     * @for ProjectWikiPageRoute
     * @private
     */
    trackedProject: inject(),

    /**
     * The model hook for this route. In this we're fetching the wiki by the provided wiki name.
     * 
     * @method model
     * @returns {Promise}
     */
    model() {
        Logger.debug("Prometheus.Routes.App.Project.Wiki.Page::setupController");
        let _self = this;

        let projectId = _self.trackedProject.getProjectId();
        let wikiName = _self.paramsFor('app.project.wiki.page').wiki_name;

        let options = {
            query: '((Wiki.name : ' + wikiName + ') AND (Wiki.projectId : ' + projectId + '))',
            sort: 'Wiki.name',
            order: 'ASC',
            limit: -1
        };

        return _self.store.query('wiki', options).catch((error) => {
            _self.errorManager.handleError(error, {
                moduleName: 'wiki'
            });
        });
    },

    /**
     * The setupController hook.
     * @param {Prometheus.Controllers.Wiki} controller 
     * @param {Prometheus.Models.Wiki} model 
     */
    setupController(controller, model) {
        model = model.objectAt(0);
        let wikiName = this.paramsFor('app.project.wiki.page').wiki_name;

        controller.set('model', model);
        if (this.model !== undefined) {
            let tags = model.get('tag');
            let tagCount = tags.get('length');
            let selectedTags = [];
            for (let i = 0; i < tagCount; i++) {
                selectedTags[i] = { label: tags.objectAt(i).get('tag'), value: tags.objectAt(i).get('id') };
            }
            controller.set('iVoted', model.get('vote').filterBy('createdUser', "1").length);
            controller.set('selectedTags', selectedTags);
            controller.set('parentId', model.get('parentId'));
        }

        this.set('breadCrumb', { title: wikiName, record: true });
    }
});