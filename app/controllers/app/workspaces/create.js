/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import PrometheusCreateController from 'prometheus/controllers/prometheus/create';
import _ from 'lodash';

/**
 * The controller of the workspace create form, the edit controller extends it.
 *
 * @class AppWorkspacesCreateController
 * @namespace Prometheus.Controllers
 * @module App.Workspaces
 * @extends PrometheusCreateController
 */
export default class AppWorkspacesCreateController extends PrometheusCreateController {

    /**
     * The fields of the form and their validations
     *
     * @property metadata
     * @type Object
     * @protected
     */
    metadata = {
        sections: [
            {
                name: 'workspaceCreate',
                fields: [
                    { name: 'name', validations: { default: { type: 'string', rules: [{ name: 'required' }] } } },
                    { name: 'shortCode', validations: { default: { type: 'string', rules: [{ name: 'required' }] } } }
                ]
            }
        ]
    };

    /**
     * The module of the form
     *
     * @property module
     * @type String
     * @protected
     */
    module = 'workspace';

    constructor() {
        super(...arguments);
        this.setupSchema();
    }

    /**
     * Saves the record. When Gaia refuses it, the error is shown on the form and the input is kept.
     *
     * @method _save
     * @param {Workspace} model
     * @param {Function} resolve
     * @param {Function} reject
     * @param {boolean} showDefaultSuccessMessage
     * @return {Promise}
     * @private
     */
    _save(model, resolve, reject, showDefaultSuccessMessage = true) {
        return model
            .save()
            .then(
                (data) => this._finishSave(data, showDefaultSuccessMessage)
                    .catch((error) => Logger.error('AppWorkspacesCreateController::_finishSave failed', error))
                    .then(() => resolve()),
                (error) => {
                    this.showGaiaError(error);
                    reject();
                }
            );
    }

    /**
     * Shows Gaia's error message under the short code field, or the name field when the error names it.
     *
     * @method showGaiaError
     * @param {Object} error
     * @protected
     */
    showGaiaError(error) {
        let first = error?.errors?.[0] ?? {};
        let detail = first.detail || first.title || this.intl.t('views.app.workspace.form.saveFailed');
        let pointer = String(first.source?.pointer ?? '');
        let field = pointer.endsWith('/name') ? 'name' : 'shortCode';
        _.set(this.message, `workspaceCreate.${field}`, detail);
        this.message = { ...this.message };
    }

    /**
     * The success message
     *
     * @method getSuccessMessage
     * @param {Workspace} model
     * @return {String}
     */
    getSuccessMessage(model) {
        return this.intl.t('views.app.workspace.form.saved', { name: model.get('name'), htmlSafe: true });
    }

    /**
     * Goes to the Overview of the saved workspace
     *
     * @method navigateToSuccess
     * @param {Workspace} model
     */
    navigateToSuccess(model) {
        this.router.transitionTo('app.workspace', model.shortCode);
    }

    /**
     * Whether the user has typed anything worth confirming a cancel for
     *
     * @method hasChanged
     * @param {Workspace} model
     * @return {boolean}
     * @protected
     */
    hasChanged(model) {
        return _.size(model.changedAttributes()) > 0;
    }

    /**
     * Goes back to the list
     *
     * @method afterCancel
     * @protected
     */
    afterCancel() {
        this.router.transitionTo('app.workspaces.index');
    }
}
