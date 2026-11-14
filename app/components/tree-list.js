/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';

/**
 * Renders the wiki page tree (recursively) and opens a wiki page when its name is clicked.
 *
 * @class TreeList
 * @namespace Prometheus.Components
 * @extends Component
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default class TreeListComponent extends Component {

    /**
     * The router Service
     *
     * @property router
     * @type Ember.Service
     * @for TreeList
     * @private
     */
    @service router;

    /**
     * Load a particular wiki page
     *
     * @method loadWiki
     * @param {String} wikiName The name of the wiki to which we need to navigate to
     * @public
     */
    @action
    loadWiki(wikiName) {
        this.router.transitionTo('app.project.wiki.page', wikiName);
    }
}
