/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { planStatusClass } from 'prometheus/utils/idea/plan-status';
import { tracked } from '@glimmer/tracking';

const OPEN = 'open';
const ARCHIVED = 'archived';
const PROGRESS_STATUSES = ['proposed', 'approved', 'creating', 'created', 'failed'];

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
     * The status of the latest plan by idea id, empty for an idea without a plan
     *
     * @property planStatuses
     * @type Object
     * @private
     */
    @tracked planStatuses = {};

    /**
     * Counts the plan loads so that only the latest one fills planStatuses
     *
     * @property planSequence
     * @type Number
     * @private
     */
    planSequence = 0;

    /**
     * The progress label key and label class of every idea by idea id: archived, brainstorming without a plan,
     * otherwise the status of the latest plan
     *
     * @property progressByIdea
     * @type Object
     * @public
     */
    get progressByIdea() {
        let progress = {};
        for (let idea of this.ideas) {
            let status = this.planStatuses[idea.id];
            if (idea.status === ARCHIVED) {
                progress[idea.id] = { label: 'views.app.idea.status.archived', class: 'deferred' };
            } else if (!status) {
                progress[idea.id] = { label: 'views.app.idea.progress.brainstorming', class: 'new' };
            } else {
                let known = PROGRESS_STATUSES.includes(status);
                progress[idea.id] = {
                    label: known ? `views.app.idea.progress.${status}` : `views.app.idea.plan.status.${status}`,
                    class: planStatusClass(status)
                };
            }
        }
        return progress;
    }

    /**
     * Loads the plans of the ideas and keeps the status of the plan with the highest version of each
     *
     * @method loadPlanStatuses
     * @param {Array} ideas
     * @param {Function} loadPlans Loads the plans of idea ids, supplied by the route
     * @returns {Promise}
     * @public
     */
    async loadPlanStatuses(ideas, loadPlans) {
        let sequence = ++this.planSequence;
        let plans = await loadPlans(ideas.map(idea => idea.id));
        let latest = {};
        for (let plan of plans?.toArray?.() ?? plans ?? []) {
            let known = latest[plan.ideaId];
            if (!known || Number(plan.version) > Number(known.version)) {
                latest[plan.ideaId] = plan;
            }
        }
        if (this.isDestroying || this.isDestroyed || sequence !== this.planSequence) {
            return;
        }
        this.planStatuses = Object.fromEntries(Object.entries(latest).map(([id, plan]) => [id, plan.status]));
    }

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
     * @param {Function} loadPlans Loads the plans of idea ids, supplied by the route
     * @returns {void}
     * @public
     */
    registerHermesIntents(projectId, loadIdeas, loadPlans) {
        this.unregisterHermesIntents();
        this.reloadSequence++;
        if (!projectId) {
            return;
        }
        this.hermesDisposer = this.hermes.register(this, projectId, {
            'idea.created': envelope => this.handleIdeaCreated(envelope, loadIdeas, loadPlans),
            'idea.updated': () => this.reloadIdeas(loadIdeas, loadPlans)
        });
    }

    /**
     * Reloads the ideas when an idea is created, unless it is listed already. An idea created here is added
     * by the create page once it is saved, so its event finds it listed; the same user creating one in
     * another tab is not listed, so that event reloads.
     *
     * @method handleIdeaCreated
     * @param {Object} envelope Domain-event envelope
     * @param {Function} loadIdeas
     * @param {Function} loadPlans
     * @returns {Promise|void}
     * @public
     */
    handleIdeaCreated(envelope, loadIdeas, loadPlans) {
        let resourceId = envelope?.resource?.id;
        if (resourceId && this.ideas.some(listed => String(listed.id) === String(resourceId))) {
            return;
        }
        return this.reloadIdeas(loadIdeas, loadPlans);
    }

    /**
     * Adds an idea to the list unless it is listed already (a reload may have brought it in first)
     *
     * @method addIdea
     * @param {Prometheus.Models.Idea} idea
     * @returns {void}
     * @public
     */
    addIdea(idea) {
        if (!this.ideas.some(listed => listed.id === idea.id)) {
            this.ideas = [...this.ideas, idea];
        }
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
     * @param {Function} loadPlans
     * @returns {Promise}
     * @public
     */
    async reloadIdeas(loadIdeas, loadPlans) {
        let sequence = ++this.reloadSequence;
        let ideas = await loadIdeas();
        if (ideas && sequence === this.reloadSequence) {
            this.ideas = ideas.toArray();
            if (loadPlans) {
                await this.loadPlanStatuses(this.ideas, loadPlans);
            }
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
