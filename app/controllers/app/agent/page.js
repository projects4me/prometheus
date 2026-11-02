/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import PrometheusCreateController from 'prometheus/controllers/prometheus/create';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

/**
 * The controller of an agent's detail page. It extends the create controller for the validation and saving the
 * Identities box needs.
 *
 * @class AppAgentPageController
 * @namespace Prometheus.Controllers
 * @module App.Agent
 * @extends PrometheusCreateController
 */
export default class AppAgentPageController extends PrometheusCreateController {
    /**
     * Validation rules of the identity form of the Identities box.
     *
     * @property metadata
     * @type Object
     */
    metadata = {
        sections: [
            {
                name: 'userIdentity',
                fields: [
                    { name: 'provider', validations: { default: { type: 'string', rules: [{ name: 'required' }] } } },
                    { name: 'handle', validations: { default: { type: 'string', rules: [{ name: 'required' }] } } },
                    { name: 'email', validations: { default: { type: 'string', rules: [{ name: 'email' }] } } }
                ]
            }
        ]
    };

    constructor() {
        super(...arguments);
        this.setupSchema();
    }

    /**
     * The agent user's role assignments.
     *
     * @property userroles
     * @type Array
     */
    userroles = [];

    /**
     * The agent user's project memberships.
     *
     * @property memberships
     * @type Array
     */
    memberships = [];

    /**
     * The tools and tool servers granted to the agent.
     *
     * @property grantedTools
     * @type Array
     */
    grantedTools = [];

    /**
     * The skills granted to the agent.
     *
     * @property grantedSkills
     * @type Array
     */
    grantedSkills = [];

    /**
     * Whether the whole role prompt is shown instead of its first lines.
     *
     * @property showWholePrompt
     * @type Boolean
     */
    @tracked showWholePrompt = false;

    /**
     * The status options of the header dropdown.
     *
     * @property statuses
     * @type Array
     */
    statuses = ['active', 'inactive'];

    /**
     * @method togglePrompt
     */
    @action togglePrompt() {
        this.showWholePrompt = !this.showWholePrompt;
    }

    /**
     * Sets the account status of the agent's user.
     *
     * @method changeStatus
     * @param {String} status `active` or `inactive`
     */
    @action async changeStatus(status) {
        await this.saveModelAttribute(this.model.user, 'accountStatus', status);
    }
}
