/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

/**
 * The controller of the Services page of the Settings area. Lists the service
 * clients and disables or enables them after a confirmation.
 *
 * @class AppSettingsServicesController
 * @namespace Prometheus.Controllers
 * @module App.Settings
 * @extends Controller
 */
export default class AppSettingsServicesController extends Controller {

    /**
     * Reports failed saves.
     *
     * @property errorManager
     * @type Prometheus.Services.ErrorManager
     * @public
     */
    @service('errorManager') errorManager;

    /**
     * The service clients listed on the page, read from the route model.
     *
     * @property serviceClients
     * @type Array
     * @public
     */
    get serviceClients() {
        return this.model ? this.model.toArray() : [];
    }

    /**
     * The service client waiting for the admin to confirm disabling or enabling it,
     * null when no confirmation is open.
     *
     * @property confirming
     * @type Prometheus.Models.Serviceclient
     * @public
     */
    @tracked confirming = null;

    /**
     * Whether a status change is being saved.
     *
     * @property saving
     * @type Boolean
     * @public
     */
    @tracked saving = false;

    /**
     * Whether the confirmation is about disabling the client (else enabling it).
     *
     * @property confirmingDisable
     * @type Boolean
     * @public
     */
    get confirmingDisable() {
        return !!this.confirming && this.confirming.isActive;
    }

    /**
     * Opens the confirmation to disable or enable a service client.
     *
     * @method confirmToggle
     * @param {Prometheus.Models.Serviceclient} serviceClient
     * @public
     */
    @action confirmToggle(serviceClient) {
        this.confirming = serviceClient;
    }

    /**
     * Closes the confirmation without changing anything.
     *
     * @method cancelToggle
     * @public
     */
    @action cancelToggle() {
        this.confirming = null;
    }

    /**
     * Saves the opposite status of the confirmed service client. A failed save
     * restores the previous status.
     *
     * @method toggleStatus
     * @public
     */
    @action async toggleStatus() {
        let serviceClient = this.confirming;
        if (!serviceClient || this.saving) {
            return;
        }

        this.saving = true;
        serviceClient.status = serviceClient.isActive ? 'disabled' : 'active';
        try {
            await serviceClient.save();
        } catch (error) {
            serviceClient.rollbackAttributes();
            this.errorManager.handleError(error, {
                moduleName: 'serviceclient'
            });
        } finally {
            if (!this.isDestroying && !this.isDestroyed) {
                this.saving = false;
                this.confirming = null;
            }
        }
    }
}
