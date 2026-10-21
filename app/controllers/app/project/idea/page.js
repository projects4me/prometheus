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
     * The messages of the idea
     *
     * @property messages
     * @type Array
     * @public
     */
    @tracked messages = [];

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
        try {
            let messages = await this.store.query('ideamessage', {
                query: `(Ideamessage.ideaId : ${idea.id})`,
                limit: -1
            });
            this.messages = messages.toArray();
        } catch (error) {
            this.errorManager.handleError(error, { moduleName: 'idea' });
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
