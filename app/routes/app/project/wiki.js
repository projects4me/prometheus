/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import M2T from "../../../utils/data/modeltotree";
import App from '../../app';
import { set } from '@ember/object';

//import { translationMacro as t } from "ember-i18n";

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
    tree:{},

    /**
     * The setup controller function that will be called every time
     * the user visits the module route, this function is responsible
     * for loading the required data for the route
     *
     * @method setupController
     * @param {Prometheus.Controllers.Wiki} controller the controller object for this route
     * @private
     */
    setupController:function(controller){

        Logger.debug('AppProjectWikiRoute::setupController');

        let self = this;
        let params = this.paramsFor('app.project');

        Logger.debug('The parameters are as follows');
        Logger.debug(params);

        Logger.debug('Inside the setup controller for the wiki project');
        let i18n = this.get('i18n');
        controller.set('i18n',i18n);

        self.loadTags();

        let options = {
            query: '(Wiki.projectId : '+params.project_id+')',
            sort : 'Wiki.name',
            rels: 'none',
            order: 'ASC',
            limit: -1
        };
        controller.set('projectId',params.project_id);
        let tree={};

        Logger.debug('Retreiving projects list with options '+options);
        self.store.query('wiki',options).then(function(data){
            Logger.debug('Wiki Retrieved');
            Logger.debug(data);
            controller.set('model',data);

            // There might be a better way to handle this but I couldn't find it
            // Ideally I should not have to pass the wikilist retrieved to the
            // sub route, they should be able to pick it up but that is not working
            // late binding/promise and all so lets just set for all the subroutes
            let wikiCount = data.get('length');
            let wikiList = [];
            let temp = null;

            wikiList[0] = {label:i18n.t("global.blank"), value:null};
            for (let i=1;i<=wikiCount;i++)
            {
                temp = data.objectAt(i-1);
                wikiList[i] = {label:temp.get('name'), value:temp.get('id')};
            }

            controller.set('wikiList',wikiList);
            self.controllerFor('app.project.wiki.page').set('wikiList', wikiList);
            self.controllerFor('app.project.wiki.create').set('wikiList', wikiList);
            self.controllerFor('app.project.wiki.edit').set('wikiList', wikiList);

            tree = M2T.modelToTree(data);

            Logger.debug(tree);
            self.set('tree',tree);
            controller.set('tree',tree);

            Logger.debug(self.get('router.currentRouteName'));

            // We need the direction
            if (self.get('router.currentRouteName') === 'app.project.wiki.index'){
                if (data.findBy('name','Home') !== undefined){
                    self.transitionTo('app.project.wiki.page',{project_id:params.projectId,wiki_name:'Home'});
                }
            }
        });
    },

    /**
     * This function is used to retrieve the list of tags in the system
     *
     * @method loadTags
     * @private
     */
    loadTags:function(){
        let self = this;
        let options = {
            fields: 'Tag.tag,Tag.id',
            sort : 'Tag.tag',
            rels: 'none',
            order: 'ASC',
            limit: -1
        };

        this.store.query('tag',options).then(function(data){
            Logger.debug('Tags Retrieved');
            Logger.debug(data);

            // There might be a better way to handle this but I couldn't find it
            // Ideally I should not have to pass the wikilist retrieved to the
            // sub route, they should be able to pick it up but that is not working
            // late binding/promise and all so lets just set for all the subroutes
            let tagCount = data.get('length');
            let tagList = [];
            let temp = null;
            for (let i=0;i<tagCount;i++)
            {
                temp = data.objectAt(i);
                tagList[i] = {label:temp.get('tag'), value:temp.get('id')};
            }
            self.controllerFor('app.project.wiki.page').set('tagList', tagList);
            self.controllerFor('app.project.wiki.edit').set('tagList', tagList);
//     self.controllerFor('app.project.wiki.create').set('wikiList', wikiList);
        });
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
    actions:{

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
        modelUpdated:function(model){
            Logger.debug('The updated model is ');
            Logger.debug(model);
            Logger.debug('The tree is');
            Logger.debug(this.get('tree'));
            let tree = this.get('tree');
            let node = M2T.findNode(model.get('id'),tree);
            if (node)
            {
                set(node,'name',model.get('name'));
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
        refreshWiki:function(){
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