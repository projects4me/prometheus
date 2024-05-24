/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import App from "prometheus/routes/app";
import M2T from "prometheus/utils/data/modeltotree";
import { set } from '@ember/object';
import { htmlSafe } from '@ember/template';
import { hashSettled } from 'rsvp';
import extractHashSettled from 'prometheus/utils/rsvp/extract-hash-settled';
import { inject } from '@ember/service';

/**
 * The project wiki page route, it is loaded when a user tried to navigate to
 * the route :projectId e.g. acme.projects4.me/app/wiki/:projectId
 *
 * @class Wiki
 * @namespace Prometheus.Routes
 * @module App.Project
 * @extends Ember.Route
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default App.extend({

    /**
     * The data for the current route
     *
     * @property data
     * @type Object
     * @for Wiki
     * @private
     */
    data: null,

    /**
     * The tree representing the list of wiki pages
     *
     * @property tree
     * @type Object
     * @for Wiki
     * @private
     */
    tree: {},

    /**
     * The trackedProject service provides id of the selected project.
     *
     * @property trackedProject
     * @type Ember.Service
     * @for ProjectWikiRoute
     * @private
     */
    trackedProject: inject(),

    /**
     * The model hook for this route. In this we're fetching the list of wikis against the selected project.
     * 
     * @method model
     * @returns {Promise}
     */
    model() {
        Logger.debug('AppProjectWikiRoute::model');

        let _self = this;
        let projectId = this.trackedProject.getProjectId();

        let tagOptions = {
            fields: 'Tag.tag,Tag.id',
            sort: 'Tag.tag',
            order: 'ASC',
            limit: -1
        };
        let wikiOptions = {
            query: '(Wiki.projectId : ' + projectId + ')',
            sort: 'Wiki.name',
            order: 'ASC',
            limit: -1
        };

        Logger.debug('-AppProjectWikiRoute::model');

        return hashSettled({
            tags: _self.store.query('tag', tagOptions),
            wiki: _self.store.query('wiki', wikiOptions)
        }).then((data) => {
            return extractHashSettled(data, 'wiki');
        }).catch((error) => {
            _self.errorManager.handleError(error, {
                moduleName: 'wiki'
            });
        });
    },

    /**
     * The setupController hook. In this hook we're calling loadTags and LoadWikis method to load
     * all tags and wikis related to the selected project.
     * 
     * @method setupController
     * @param {Prometheus.Controllers.Wiki} controller 
     * @param {Prometheus.Models.Wiki} model 
     */
    setupController(controller, model) {
        controller.set('projectId', this.trackedProject.getProjectId());
        this.loadTags(model.tags);
        this.LoadWikis(model.wiki, controller);
    },

    /**
     * This function is used to prepare tags list.
     *
     * @method loadTags
     * @param {Prometheus.Models.Tag}
     * @private
     */
    loadTags(tags) {
        let tagList = [];
        let temp = null;

        for (let i = 0; i < tags.length; i++) {
            temp = tags.objectAt(i);
            tagList[i] = { label: temp.get('tag'), value: temp.get('id') };
        }

        this.controllerFor('app.project.wiki.page').set('tagList', tagList);
        this.controllerFor('app.project.wiki.edit').set('tagList', tagList);
    },

    /**
     * This function prepare wikis list. 
     * 
     * @method LoadWikis
     * @param {Prometheus.Models.Wiki} wikis 
     * @param {Prometheus.Controller.Wiki} controller 
     */
    LoadWikis(wikis, controller) {
        controller.set('model', wikis);

        // There might be a better way to handle this but I couldn't find it
        // Ideally I should not have to pass the wikilist retrieved to the
        // sub route, they should be able to pick it up but that is not working
        // late binding/promise and all so lets just set for all the subroutes
        let wikiList = [];
        let temp = null;
        let intl = this.intl;
        let tree = {};

        wikiList[0] = { label: htmlSafe(intl.t("global.blank")), value: null };
        for (let i = 1; i <= wikis.length; i++) {
            temp = wikis.objectAt(i - 1);
            wikiList[i] = { label: temp.get('name'), value: temp.get('id') };
        }

        controller.set('wikiList', wikiList);
        this.controllerFor('app.project.wiki.page').set('wikiList', wikiList);
        this.controllerFor('app.project.wiki.create').set('wikiList', wikiList);
        this.controllerFor('app.project.wiki.edit').set('wikiList', wikiList);

        tree = M2T.modelToTree(wikis);

        Logger.debug(tree);
        this.set('tree', tree);
        controller.set('tree', tree);

        Logger.debug(this.get('router.currentRouteName'));

        // We need the direction
        if (this.get('router.currentRouteName') === 'app.project.wiki.index') {
            if (wikis.findBy('name', 'Home') !== undefined) {
                this.transitionTo('app.project.wiki.page', 'Home');
            }
        }
    },


    /**
     * The actions that this route would handle, normally route should not have to
     * handle any event from the view but in this case I do not want to send a hit
     * to the server to retrieve the updated wiki list I want the route to update
     * it self as we already have the updated model available to us.
     *
     * @property actions
     * @type Object
     * @for Wiki
     * @public
     */
    actions: {

        /**
         * This function is called the an individual wiki is updated that requires
         * the tree in this parent route to be updated. The controller for the
         * sub-route throws the action which is caught by this parent route
         * This function is called when the wiki name is updated.
         *
         * @method modelUpdated
         * @param {Prometheus.Models.Wiki} model the updated model of wiki
         * @public
         */
        modelUpdated: function (model) {
            Logger.debug('The updated model is ');
            Logger.debug(model);
            Logger.debug('The tree is');
            Logger.debug(this.tree);
            let tree = this.tree;
            let node = M2T.findNode(model.get('id'), tree);
            if (node) {
                set(node, 'name', model.get('name'));
            }
        },

        /**
         * This function is called the an individual wiki is updated that requires
         * the tree in this parent route to be updated. The controller for the
         * sub-route throws the action which is caught by this parent route
         * This function is called when the parent of the wiki is updated
         * Tried to simply update the tree but that did not work, had to resort to
         * refresh the the whole route. Interestingly this works when I am updating
         * the a node's name in the function above but when I try to update the tree
         * hierarchy then it fails.
         *
         * @method refreshWiki
         * @public
         */
        refreshWiki: function () {
            Logger.debug('AppProjectWikiRoute::refreshWiki');
            this.refresh();

            // Logger.debug('The updated model is ');
            // Logger.debug(model);
            // Logger.debug('The tree is');
            // Logger.debug(this.get('tree'));
            // var tree = this.get('tree');
            // // Find the nodes, current, new parent and old parent
            // var ownNode = M2T.findNode(model.get('id'),tree);
            // var parentNode = M2T.findNode(model.get('parentId'),tree);
            // var oldParentNode = M2T.findParent(model.get('id'),tree);
            // // remove from the old parent
            // var nodes = oldParentNode['nodes'];
            // delete nodes[ownNode.id];
            // Ember.set(oldParentNode,'nodes',nodes);
            // // set in the new parent
            // nodes = parentNode['nodes'];
            // nodes[ownNode.id] = ownNode;
            // Ember.set(parentNode,'nodes',nodes);
            // Logger.debug(tree);
            // Logger.debug(this);
            // this.set('controller.tree',tree);
        },

    },

});