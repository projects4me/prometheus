/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { postToast } from 'prometheus/utils/ui/post-toast';

/**
 * The controller of the Services page of the Settings area. Lists the service
 * clients and disables or enables them after a confirmation, approves or denies
 * enrollment requests and creates and revokes enrollment tokens.
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
     * The store, to create enrollment tokens.
     *
     * @property store
     * @type DS.Store
     * @public
     */
    @service store;

    /**
     * Translates the toast that tells the token was copied.
     *
     * @property intl
     * @type Object
     * @public
     */
    @service intl;

    /**
     * The kinds of service (as select options) an enrollment token can be created for.
     *
     * @property kinds
     * @type Array
     * @public
     */
    kindOptions = [{ value: 'runtime', label: 'runtime' }, { value: 'hermes', label: 'hermes' }];

    /**
     * The service clients listed on the page, read from the route model.
     *
     * @property serviceClients
     * @type Array
     * @public
     */
    get serviceClients() {
        return this.model && this.model.serviceClients ? this.model.serviceClients.slice() : [];
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

    /**
     * The enrollment requests of the page, kept here so a decided request leaves the list.
     *
     * @property enrollments
     * @type Array
     * @public
     */
    @tracked enrollments = [];

    /**
     * The enrollment tokens of the page.
     *
     * @property tokens
     * @type Array
     * @public
     */
    @tracked tokens = [];

    /**
     * The enrollment request waiting for the admin to confirm the decision.
     *
     * @property deciding
     * @type Prometheus.Models.Serviceenrollment
     * @public
     */
    @tracked deciding = null;

    /**
     * The decision being confirmed: approved or denied.
     *
     * @property decision
     * @type String
     * @public
     */
    @tracked decision = null;

    /**
     * Name typed in the create token form.
     *
     * @property tokenName
     * @type String
     * @public
     */
    @tracked tokenName = '';

    /**
     * Kind chosen in the create token form.
     *
     * @property tokenKind
     * @type String
     * @public
     */
    @tracked tokenKind = 'runtime';

    /**
     * The token just created, shown once. Null when nothing is shown.
     *
     * @property createdToken
     * @type Object
     * @public
     */
    @tracked createdToken = null;

    /**
     * Whether a token is being created.
     *
     * @property creating
     * @type Boolean
     * @public
     */
    @tracked creating = false;

    /**
     * Clears the open dialogs and the form, and takes the lists from the model.
     *
     * @method reset
     * @public
     */
    reset() {
        this.confirming = null;
        this.deciding = null;
        this.decision = null;
        this.createdToken = null;
        this.tokenName = '';
        this.tokenKind = 'runtime';
        let model = this.model || {};
        this.enrollments = model.enrollments ? model.enrollments.slice() : [];
        this.tokens = model.tokens ? model.tokens.slice() : [];
    }

    /**
     * The requests waiting for an admin, with the minutes left before they expire.
     *
     * @property pendingRequests
     * @type Array
     * @public
     */
    get pendingRequests() {
        let now = Date.now();
        return this.enrollments
            .filter(request => request.status === 'pending' || request.status === 'expired')
            .map(request => {
                let left = Math.ceil((this.toTime(request.expiresAt) - now) / 60000);
                let expired = request.status === 'expired' || left <= 0;
                return { record: request, expired, minutesLeft: expired ? 0 : left };
            });
    }

    /**
     * The enrollment tokens with their state: used, expired or active.
     *
     * @property tokenRows
     * @type Array
     * @public
     */
    get tokenRows() {
        let now = Date.now();
        return this.tokens.map(token => {
            let state = token.usedAt ? 'used' : (this.toTime(token.expiresAt) <= now ? 'expired' : 'active');
            return { record: token, state };
        });
    }

    /**
     * Whether the create token form can be submitted.
     *
     * @property canCreateToken
     * @type Boolean
     * @public
     */
    get canCreateToken() {
        return this.tokenName.trim() !== '' && !this.creating;
    }

    /**
     * Reads a Gaia date time (UTC) as milliseconds.
     *
     * @method toTime
     * @param {String} value
     * @returns {Number}
     * @private
     */
    toTime(value) {
        let text = String(value || '');
        return new Date(/[zZ]|[+-]\d\d:?\d\d$/.test(text) ? text : text.replace(' ', 'T') + 'Z').getTime();
    }

    /**
     * Opens the confirmation to approve or deny an enrollment request.
     *
     * @method confirmDecision
     * @param {Prometheus.Models.Serviceenrollment} request
     * @param {String} decision approved or denied
     * @public
     */
    @action confirmDecision(request, decision) {
        this.deciding = request;
        this.decision = decision;
    }

    /**
     * Closes the confirmation without deciding.
     *
     * @method cancelDecision
     * @public
     */
    @action cancelDecision() {
        this.deciding = null;
        this.decision = null;
    }

    /**
     * Saves the confirmed decision. A failed save restores the request.
     *
     * @method decide
     * @public
     */
    @action async decide() {
        let request = this.deciding;
        if (!request || this.saving) {
            return;
        }

        this.saving = true;
        request.status = this.decision;
        try {
            await request.save();
            if (!this.isDestroying && !this.isDestroyed) {
                this.enrollments = this.enrollments.filter(item => item !== request);
            }
        } catch (error) {
            request.rollbackAttributes();
            this.errorManager.handleError(error, { moduleName: 'serviceenrollment' });
        } finally {
            if (!this.isDestroying && !this.isDestroyed) {
                this.saving = false;
                this.deciding = null;
                this.decision = null;
            }
        }
    }

    /**
     * The select option of the kind chosen in the create token form.
     *
     * @property selectedKind
     * @type Object
     * @public
     */
    get selectedKind() {
        return this.kindOptions.find(option => option.value === this.tokenKind);
    }

    /**
     * Takes the kind chosen in the create token form.
     *
     * @method selectKind
     * @param {Object} option
     * @public
     */
    @action selectKind(option) {
        this.tokenKind = option.value;
    }

    /**
     * Creates an enrollment token and shows its secret once.
     *
     * @method createToken
     * @param {Event} [event]
     * @public
     */
    @action async createToken(event) {
        if (event && event.preventDefault) {
            event.preventDefault();
        }
        if (!this.canCreateToken) {
            return;
        }

        this.creating = true;
        let record = this.store.createRecord('serviceenrollmenttoken', {
            name: this.tokenName.trim(),
            kind: this.tokenKind
        });
        try {
            await record.save();
            if (this.isDestroying || this.isDestroyed) {
                return;
            }
            this.createdToken = { name: record.name, token: record.token };
            this.tokens = [record, ...this.tokens];
            this.tokenName = '';
        } catch (error) {
            record.unloadRecord();
            this.errorManager.handleError(error, { moduleName: 'serviceenrollmenttoken' });
        } finally {
            if (!this.isDestroying && !this.isDestroyed) {
                this.creating = false;
            }
        }
    }

    /**
     * Hides the created token. It cannot be shown again.
     *
     * @method closeCreatedToken
     * @public
     */
    @action closeCreatedToken() {
        this.createdToken = null;
    }

    /**
     * Copies the created token to the clipboard.
     *
     * @method copyToken
     * @public
     */
    @action async copyToken() {
        if (!this.createdToken) {
            return;
        }
        try {
            await navigator.clipboard.writeText(this.createdToken.token);
            postToast(this.intl, 'views.app.settings.services.copied');
        } catch (error) {
            postToast(this.intl, 'views.app.settings.services.copyFailed', 'error');
        }
    }

    /**
     * Revokes an enrollment token. A failed delete restores it.
     *
     * @method revokeToken
     * @param {Prometheus.Models.Serviceenrollmenttoken} token
     * @public
     */
    @action async revokeToken(token) {
        try {
            await token.destroyRecord();
            if (!this.isDestroying && !this.isDestroyed) {
                this.tokens = this.tokens.filter(item => item !== token);
            }
        } catch (error) {
            token.rollbackAttributes();
            this.errorManager.handleError(error, { moduleName: 'serviceenrollmenttoken' });
        }
    }
}
