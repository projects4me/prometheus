/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

const OPEN = 'open';
const ARCHIVED = 'archived';

/**
 * The controller of the idea browser. It decides which ideas of the project are listed.
 *
 * @class Idea
 * @namespace Prometheus.Controllers
 * @module App.Project
 * @extends Controller
 */
export default class AppProjectIdeaController extends Controller {
    /**
     * @property hermes
     * @type Ember.Service
     * @public
     */
    @service hermes;

    /**
     * Disposer of the Hermes registration
     *
     * @property hermesDisposer
     * @type Function
     * @private
     */
    hermesDisposer = null;

    /**
     * The ideas of the selected project, loaded by the route
     *
     * @property ideas
     * @type Array
     * @public
     */
    @tracked ideas = [];

    /**
     * The identifier of the idea that is open on the page route, null on the others
     *
     * @property selectedIdeaId
     * @type String
     * @public
     */
    @tracked selectedIdeaId = null;

    /**
     * Whether the archived ideas are listed after the open ones
     *
     * @property showArchived
     * @type Boolean
     * @public
     */
    @tracked showArchived = false;

    /**
     * The ideas sorted by the date they were last modified, newest first
     *
     * @property sortedIdeas
     * @type Array
     * @private
     */
    get sortedIdeas() {
        return [...this.ideas].sort((a, b) => String(b.dateModified).localeCompare(String(a.dateModified)));
    }

    /**
     * The open ideas, newest updated first
     *
     * @property openIdeas
     * @type Array
     * @public
     */
    get openIdeas() {
        return this.sortedIdeas.filter(idea => idea.status === OPEN);
    }

    /**
     * The archived ideas, newest updated first
     *
     * @property archivedIdeas
     * @type Array
     * @public
     */
    get archivedIdeas() {
        return this.sortedIdeas.filter(idea => idea.status === ARCHIVED);
    }

    /**
     * The ideas that are listed in the browser
     *
     * @property listedIdeas
     * @type Array
     * @public
     */
    get listedIdeas() {
        return this.showArchived ? [...this.openIdeas, ...this.archivedIdeas] : this.openIdeas;
    }

    /**
     * Sequence of the latest reload; leaving the route or registering for another project also bumps it,
     * so a slower reload of an earlier project or request cannot overwrite the list
     *
     * @property reloadSequence
     * @type Number
     * @private
     */
    reloadSequence = 0;

    /**
     * Registers the events that change the idea list
     *
     * @method registerHermesIntents
     * @param {String} projectId
     * @param {Function} loadIdeas Loads the ideas of the project, supplied by the route
     * @returns {void}
     * @public
     */
    registerHermesIntents(projectId, loadIdeas) {
        this.unregisterHermesIntents();
        this.reloadSequence++;
        if (!projectId) {
            return;
        }
        this.hermesDisposer = this.hermes.register(this, projectId, {
            'idea.created': () => this.reloadIdeas(loadIdeas),
            'idea.updated': () => this.reloadIdeas(loadIdeas)
        });
    }

    /**
     * Disposes the Hermes registration
     *
     * @method unregisterHermesIntents
     * @returns {void}
     * @public
     */
    unregisterHermesIntents() {
        this.reloadSequence++;
        this.hermesDisposer?.();
        this.hermesDisposer = null;
    }

    /**
     * Reloads the ideas of the project
     *
     * @method reloadIdeas
     * @param {Function} loadIdeas
     * @returns {Promise}
     * @public
     */
    async reloadIdeas(loadIdeas) {
        let sequence = ++this.reloadSequence;
        let ideas = await loadIdeas();
        if (ideas && sequence === this.reloadSequence) {
            this.ideas = ideas.toArray();
        }
    }

    /**
     * Shows or hides the archived ideas
     *
     * @method toggleArchived
     * @public
     */
    @action
    toggleArchived() {
        this.showArchived = !this.showArchived;
    }
}
