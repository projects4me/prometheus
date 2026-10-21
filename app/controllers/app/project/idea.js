/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Controller from '@ember/controller';
import { action } from '@ember/object';
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
