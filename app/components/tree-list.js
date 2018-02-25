/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@ember/component';

/**
 * This component is used to help the event handling of route request in the
 * tree-list
 *
 * @class TreeList
 * @namespace Prometheus.Components
 * @extends Ember.Component
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default Component.extend({

    /**
     * These are the evet handlers for the component.
     *
     * @property actions
     * @type Object
     * @for TreeList
     * @public
     */
    actions:{

        /**
         * Load a particular wiki page
         *
         * @method loadWiki
         * @param {String} projectId The projectId to which the wiki belogns to
         * @param {String} wikiName The name of the wiki to which we need to navigate to
         * @public
         * @todo Trigger the notificaiton
         */
        loadWiki:function(projectId,wikiName) {
            // This route is not exposed by EmbberJS, we included this by utilizing
            // intializer. Normally this would not be required but the tree view
            // causes us to call the same component recursively and thus it becomes
            // very difficult to pass action context across
            this.get('router').transitionTo('app.project.wiki.page',{project_id:projectId,wiki_name:wikiName});
        }

    }

});