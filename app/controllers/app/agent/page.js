/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import PrometheusCreateController from 'prometheus/controllers/prometheus/create';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';

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

    @service profilePicture;

    /**
     * The picture chosen for the agent's user, waiting to be cropped.
     *
     * @property cropImageSrc
     * @type String
     */
    @tracked cropImageSrc = null;

    /**
     * Validates the chosen picture and opens the cropper on it.
     *
     * @method uploadImage
     * @param {String} _imageElementClass
     * @param {Object} file
     */
    @action
    async uploadImage(_imageElementClass, file) {
        this.cropImageSrc = (await this.profilePicture.read(file)) ?? this.cropImageSrc;
    }

    /**
     * Saves the cropped picture on the agent's user.
     *
     * @method applyCrop
     * @param {String} croppedBase64
     */
    @action
    async applyCrop(croppedBase64) {
        if (await this.profilePicture.save(this.model.user, croppedBase64)) {
            this.cropImageSrc = null;
        }
    }

    /**
     * Closes the cropper without saving.
     *
     * @method cancelCrop
     */
    @action
    cancelCrop() {
        this.cropImageSrc = null;
    }

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
     * The activities the agent did or that were done to it, newest first.
     *
     * @property activities
     * @type Array
     */
    @tracked activities = [];

    /**
     * The activities grouped by the date they were created on, in the shape the timeline component expects.
     *
     * @property groupedActivities
     * @type Object
     */
    get groupedActivities() {
        let groups = {};

        this.activities.forEach((activity) => {
            let date = activity.dateCreated.substring(0, 10);

            groups[date] = groups[date] || { dateCreated: date, data: [] };
            groups[date].data.push(activity);
        });

        return groups;
    }

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
