/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import PrometheusCreateController from 'prometheus/controllers/prometheus/create';
import { inject as controller } from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { htmlSafe } from '@ember/template';
import { guidFor } from '@ember/object/internals';

/**
 * The controller of the new idea page. It creates the idea with its first message
 * and opens the idea page.
 *
 * @class Create
 * @namespace Prometheus.Controllers
 * @module App.Project.Idea
 * @extends PrometheusCreateController
 */
export default class AppProjectIdeaCreateController extends PrometheusCreateController {
    /**
     * The validation metadata of the form
     *
     * @property metadata
     * @type Object
     * @protected
     */
    metadata = {
        sections: [
            {
                name: 'ideaCreate',
                fields: [
                    {
                        name: 'title',
                        validations: {
                            default: {
                                type: 'string',
                                rules: [
                                    { name: 'required' },
                                    { name: 'max', value: [200] }
                                ]
                            }
                        }
                    },
                    {
                        name: 'description',
                        validations: {
                            default: {
                                type: 'string',
                                rules: []
                            }
                        }
                    }
                ]
            }
        ]
    };

    /**
     * The module the validation errors are shown for
     *
     * @property module
     * @type String
     * @protected
     */
    module = 'idea';

    /**
     * The controller of the idea browser, its list is refreshed with the new idea
     *
     * @property ideaController
     * @type Prometheus.Controllers.App.Project.Idea
     * @public
     */
    @controller('app.project.idea') ideaController;

    /**
     * @property pubSub
     * @type Ember.Service
     * @public
     */
    @service pubSub;

    /**
     * The pubSub event which clears the description editor of the form
     *
     * @property clearEvent
     * @type String
     * @public
     */
    clearEvent = `clearContents-${guidFor(this)}`;

    /**
     * Whether the idea is being saved, the form can't be emptied meanwhile
     *
     * @property isSaving
     * @type Boolean
     * @public
     */
    @tracked isSaving = false;

    /**
     * Builds the validation schema of the form
     *
     * @method constructor
     * @public
     */
    constructor() {
        super(...arguments);
        this.setupSchema();
    }

    /**
     * Adds the first message of the idea, its body is the description of the idea
     *
     * @method afterSave
     * @param {Prometheus.Models.Idea} idea
     * @returns {Promise}
     * @protected
     */
    async afterSave(idea) {
        await this.store.createRecord('ideamessage', {
            ideaId: idea.id,
            body: idea.description
        }).save();
    }

    /**
     * Adds the idea to the browser list and opens its page
     *
     * @method navigateToSuccess
     * @param {Prometheus.Models.Idea} idea
     * @protected
     */
    navigateToSuccess(idea) {
        this.ideaController.addIdea(idea);
        this.transitionToRoute('app.project.idea.page', idea.id);
    }

    /**
     * @method getSuccessMessage
     * @param {Prometheus.Models.Idea} idea
     * @protected
     */
    getSuccessMessage(idea) {
        return htmlSafe(this.intl.t('views.app.idea.created', { title: idea.title }));
    }

    /**
     * Saves the idea and keeps track of it, so cancel can't empty the form while it is in flight
     *
     * @method _save
     * @private
     */
    _save(model, resolve, reject, showDefaultSuccessMessage = true) {
        this.isSaving = true;
        return super._save(
            model,
            () => {
                this.isSaving = false;
                resolve();
            },
            () => {
                this.isSaving = false;
                reject();
            },
            showDefaultSuccessMessage
        );
    }

    /**
     * Ignores cancel while the idea is being saved
     *
     * @method cancel
     * @public
     */
    @action cancel() {
        if (!this.isSaving) {
            super.cancel();
        }
    }

    /**
     * Empties the form: the title, the description, the editor and the validation messages
     *
     * @method afterCancel
     * @protected
     */
    afterCancel() {
        this.model.title = '';
        this.model.description = '';
        this.message = {};
        this.pubSub.trigger(this.clearEvent);
    }
}
