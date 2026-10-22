/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

/**
 * The controller of one idea. It loads the messages of the idea and saves what is written in the
 * conversation box: new messages, the new title and the archive status.
 *
 * @class Page
 * @namespace Prometheus.Controllers
 * @module App.Project.Idea
 * @extends Controller
 */
export default class AppProjectIdeaPageController extends Controller {
    /**
     * @property store
     * @type Ember.Service
     * @public
     */
    @service store;

    /**
     * The error manager reports failed saves
     *
     * @property errorManager
     * @type Ember.Service
     * @public
     */
    @service errorManager;

    /**
     * The Hermes service pushes the events of the idea
     *
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
     * The messages of the idea
     *
     * @property messages
     * @type Array
     * @public
     */
    @tracked messages = [];

    /**
     * The plan versions of the idea
     *
     * @property plans
     * @type Array
     * @public
     */
    @tracked plans = [];

    /**
     * The links between the idea and the issues created from its plans
     *
     * @property planIssues
     * @type Array
     * @public
     */
    @tracked planIssues = [];

    /**
     * The id of the idea whose messages are in the list
     *
     * @property loadedIdeaId
     * @type String
     * @private
     */
    loadedIdeaId = null;

    /**
     * Sequence of the latest message query, so a slower earlier query cannot overwrite a newer list
     *
     * @property loadSequence
     * @type Number
     * @private
     */
    loadSequence = 0;

    /**
     * The id of the idea whose plans are in the plan boxes
     *
     * @property loadedPlansIdeaId
     * @type String
     * @private
     */
    loadedPlansIdeaId = null;

    /**
     * Sequence of the latest plan query, so a slower earlier query cannot overwrite a newer one
     *
     * @property planSequence
     * @type Number
     * @private
     */
    planSequence = 0;

    /**
     * Loads the messages of the idea, also used by the refresh box-tool
     *
     * @method loadMessages
     * @returns {Promise}
     * @public
     */
    @action
    async loadMessages() {
        let idea = this.model;
        if (!idea) {
            this.messages = [];
            return;
        }
        if (this.loadedIdeaId !== idea.id) {
            this.messages = [];
            this.loadedIdeaId = idea.id;
        }
        let sequence = ++this.loadSequence;
        try {
            let messages = await this.store.query('ideamessage', {
                query: `(Ideamessage.ideaId : ${idea.id})`,
                limit: -1
            });
            if (this.model?.id === idea.id && sequence === this.loadSequence) {
                let loaded = messages.toArray();
                let appended = this.messages.filter(item => !loaded.some(message => message.id === item.id));
                this.messages = [...loaded, ...appended];
            }
        } catch (error) {
            this.errorManager.handleError(error, { moduleName: 'idea' });
        }
    }

    /**
     * Loads the plan versions and the created issues of the idea
     *
     * @method loadPlans
     * @returns {Promise}
     * @public
     */
    @action
    async loadPlans() {
        let idea = this.model;
        if (!idea) {
            this.plans = [];
            this.planIssues = [];
            this.loadedPlansIdeaId = null;
            return;
        }
        if (this.loadedPlansIdeaId !== idea.id) {
            this.plans = [];
            this.planIssues = [];
            this.loadedPlansIdeaId = idea.id;
        }
        let sequence = ++this.planSequence;
        try {
            let [plans, links] = await Promise.all([
                this.store.query('ideaplan', { query: `(Ideaplan.ideaId : ${idea.id})`, limit: -1 }),
                this.store.query('ideaplanissue', { query: `(Ideaplanissue.ideaId : ${idea.id})`, limit: -1 })
            ]);
            if (this.model?.id === idea.id && sequence === this.planSequence) {
                this.plans = plans.toArray();
                this.planIssues = links.toArray();
            }
        } catch (error) {
            this.errorManager.handleError(error, { moduleName: 'idea' });
        }
    }

    /**
     * Registers the idea events of the tracked project with Hermes
     *
     * @method registerHermesIntents
     * @param {String} projectId
     * @returns {void}
     * @public
     */
    registerHermesIntents(projectId) {
        this.unregisterHermesIntents();
        if (!projectId) {
            return;
        }
        this.hermesDisposer = this.hermes.register(this, projectId, {
            'idea.updated': envelope => this.onOpenIdea(envelope, () => this.reloadIdea()),
            'idea.message.created': envelope => this.onOpenIdea(envelope, () => this.appendMessage(envelope)),
            'idea.plan.created': envelope => this.onOpenIdea(envelope, () => this.loadPlans()),
            'idea.plan.status.changed': envelope => this.onOpenIdea(envelope, () => this.loadPlans()),
            'idea.planissue.created': envelope => this.onOpenIdea(envelope, () => this.loadPlans())
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
        this.hermesDisposer?.();
        this.hermesDisposer = null;
    }

    /**
     * Runs the handler only for events of the open idea
     *
     * @method onOpenIdea
     * @param {Object} envelope Domain-event envelope
     * @param {Function} handler
     * @returns {void}
     * @private
     */
    onOpenIdea(envelope, handler) {
        let ideaId = envelope?.meta?.ideaId;
        if (this.model && ideaId && String(ideaId) === String(this.model.id)) {
            handler();
        }
    }

    /**
     * Reloads the idea header
     *
     * @method reloadIdea
     * @returns {Promise}
     * @private
     */
    async reloadIdea() {
        try {
            await this.model.reload();
        } catch (error) {
            this.errorManager.handleError(error, { moduleName: 'idea' });
        }
    }

    /**
     * Loads the message of an event and appends it unless the thread has it already
     *
     * @method appendMessage
     * @param {Object} envelope Domain-event envelope
     * @returns {Promise}
     * @private
     */
    async appendMessage(envelope) {
        let idea = this.model;
        let id = envelope.resource?.id;
        if (!id || this.messages.some(message => message.id === String(id))) {
            return;
        }
        try {
            let message = await this.store.findRecord('ideamessage', id);
            if (this.model === idea && !this.messages.some(item => item.id === message.id)) {
                this.messages = [...this.messages, message];
            }
        } catch (error) {
            this.errorManager.handleError(error, { moduleName: 'idea' });
        }
    }

    /**
     * The name of the user who created the idea, taken from the first message of that user
     *
     * @property createdUserName
     * @type String
     * @public
     */
    get createdUserName() {
        let author = this.messages.find(message => message.createdUser === this.model?.createdUser);
        return author?.createdUserName ?? '';
    }

    /**
     * Approves a plan version
     *
     * @method approvePlan
     * @param {Prometheus.Models.Ideaplan} plan
     * @returns {Promise}
     * @public
     */
    @action
    async approvePlan(plan) {
        plan.status = 'approved';
        try {
            await plan.save();
        } catch (error) {
            plan.rollbackAttributes();
            this.errorManager.handleError(error, { moduleName: 'idea' });
            throw error;
        }
    }

    /**
     * Creates a message of the idea and reloads the thread
     *
     * @method send
     * @param {String} body
     * @returns {Promise}
     * @public
     */
    @action
    async send(body) {
        try {
            await this.store.createRecord('ideamessage', { ideaId: this.model.id, body }).save();
        } catch (error) {
            this.errorManager.handleError(error, { moduleName: 'idea' });
            throw error;
        }
        await this.loadMessages();
    }

    /**
     * Renames the idea, a blank title is refused
     *
     * @method rename
     * @param {String} title
     * @returns {Promise}
     * @public
     */
    @action
    async rename(title) {
        title = (title ?? '').trim();
        if (!title) {
            throw new Error('The title of an idea is required');
        }
        await this.saveIdea({ title });
    }

    /**
     * Archives an open idea and opens an archived one again
     *
     * @method toggleArchive
     * @returns {Promise}
     * @public
     */
    @action
    async toggleArchive() {
        await this.saveIdea({ status: this.model.status === 'archived' ? 'open' : 'archived' });
    }

    /**
     * Saves attributes of the idea, they are rolled back when the save fails
     *
     * @method saveIdea
     * @param {Object} attributes
     * @returns {Promise}
     * @private
     */
    async saveIdea(attributes) {
        let idea = this.model;
        idea.setProperties(attributes);
        try {
            await idea.save();
        } catch (error) {
            idea.rollbackAttributes();
            this.errorManager.handleError(error, { moduleName: 'idea' });
            throw error;
        }
    }
}
