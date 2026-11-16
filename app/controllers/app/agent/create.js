/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import PrometheusCreateController from 'prometheus/controllers/prometheus/create';
import { inject as controller } from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { scopeOptions, searchScopes } from 'prometheus/utils/agent-scopes';

/**
 * The models the agent runtime can be set to.
 *
 * @constant MODELS
 * @type Array
 */
const MODELS = ['haiku', 'sonnet', 'opus'];

/**
 * How the agent's tool calls are approved.
 *
 * @constant PERMISSION_MODES
 * @type Array
 */
const PERMISSION_MODES = ['default', 'acceptEdits', 'auto', 'plan'];

/**
 * The controller to create and edit an agent. It owns the form state: the model selects that read and write
 * `modelConfig`, the access selections (roles, projects, active) that become the agent user's memberships and
 * status, and saves them after the agent itself.
 *
 * @class AppAgentCreateController
 * @namespace Prometheus.Controllers
 * @module App.Agent
 * @extends PrometheusCreateController
 */
export default class AppAgentCreateController extends PrometheusCreateController {
    /**
     * Validation rules of the form.
     *
     * @property metadata
     * @type Object
     */
    metadata = {
        sections: [
            {
                name: 'agentForm',
                fields: [
                    { name: 'name', validations: { default: { type: 'string', rules: [{ name: 'required' }] } } },
                    { name: 'email', validations: { default: { type: 'string', rules: [{ name: 'required' }, { name: 'email' }] } } },
                    { name: 'purpose', validations: { default: { type: 'string', rules: [] } } }
                ]
            }
        ]
    };

    module = 'agent';
    showFieldInfo = true;

    constructor() {
        super(...arguments);
        this.setupSchema();
    }

    @controller('app') appController;

    /**
     * The roles to choose from, as `{label, value}`.
     *
     * @property rolesList
     * @type Array
     */
    @tracked rolesList = [];

    /**
     * The projects to choose from, as `{label, value}`.
     *
     * @property projectsList
     * @type Array
     */
    @tracked projectsList = [];

    /**
     * The roles chosen for the agent's user.
     *
     * @property selectedRoles
     * @type Array
     */
    @tracked selectedRoles = [];

    /**
     * The projects chosen for the agent's user.
     *
     * @property selectedProjects
     * @type Array
     */
    @tracked selectedProjects = [];

    /**
     * Whether the agent's user is active.
     *
     * @property active
     * @type Boolean
     */
    @tracked active = true;

    /**
     * The delegation scopes chosen for the agent, as `{label, value}`.
     *
     * @property selectedScopes
     * @type Array
     */
    @tracked selectedScopes = [];

    /**
     * The model for the three model selects.
     *
     * @property modelConfig
     * @type Object
     */
    @tracked modelConfig = {};

    /**
     * The roles and project memberships the agent's user has already (edit only).
     *
     * @property current
     * @type Object
     */
    current = { userroles: [], memberships: [] };

    /**
     * Whether this form edits an existing agent.
     *
     * @property isEdit
     * @type Boolean
     */
    get isEdit() {
        return !this.model?.isNew;
    }

    /**
     * The users the sponsor can be picked from.
     *
     * @property usersList
     * @type Array
     */
    get usersList() {
        return this.appController.usersList;
    }

    /**
     * @property modelOptions
     * @type Array
     */
    get modelOptions() {
        return MODELS.map((value) => ({ label: value, value }));
    }

    /**
     * @property permissionModeOptions
     * @type Array
     */
    get permissionModeOptions() {
        return PERMISSION_MODES.map((value) => ({ label: value, value }));
    }

    /**
     * The delegation scope suggestions.
     *
     * @property scopeOptions
     * @type Array
     */
    scopeOptions = scopeOptions();

    /**
     * Fills the form from the route's data.
     *
     * @method setupForm
     * @param {Object} options the `roles` and `projects` to choose from
     * @param {Object} current the `userroles` and `memberships` the user has already
     */
    setupForm(options, current) {
        this.current = { userroles: current.userroles ?? [], memberships: current.memberships ?? [] };
        this.rolesList = options.roles;
        this.projectsList = options.projects;
        this.selectedRoles = this.rolesList.filter((role) => this.current.userroles.some((userrole) => userrole.roleId === role.value));
        this.selectedProjects = this.projectsList.filter((project) => this.current.memberships.some((membership) => membership.projectId === project.value));
        this.modelConfig = { ...this.model.config };
        this.selectedScopes = (this.model.delegationScopes ?? []).map((value) => ({ label: value, value }));
        this.active = this.model.isNew ? true : this.model.isActive;
        this.message = {};
    }

    /**
     * Sets one of the three model selects.
     *
     * @method selectModel
     * @param {String} key `simple`, `complex` or `escalation`
     * @param {Object} option the chosen option
     */
    @action selectModel(key, option) {
        this.modelConfig = { ...this.modelConfig, [key]: option.value };
    }

    /**
     * Searches the scope suggestions; the typed text is offered as an entry of its own.
     *
     * @method searchScopes
     * @param {String} term what the user typed
     * @return {Array} the options
     */
    @action searchScopes(term) {
        return searchScopes(this.scopeOptions, term);
    }

    /**
     * @method selectScopes
     * @param {Array} scopes the chosen scopes
     */
    @action selectScopes(scopes) {
        this.selectedScopes = scopes;
    }

    /**
     * @method selectRoles
     * @param {Array} roles the chosen roles
     */
    @action selectRoles(roles) {
        this.selectedRoles = roles;
    }

    /**
     * @method selectProjects
     * @param {Array} projects the chosen projects
     */
    @action selectProjects(projects) {
        this.selectedProjects = projects;
    }

    /**
     * @method toggleActive
     * @param {Event} event the change event of the checkbox
     */
    @action toggleActive(event) {
        this.active = event.target.checked;
    }

    /**
     * Writes the model config and, for a new agent, the account status into the record before it is saved.
     *
     * @method beforeSave
     * @param {Prometheus.Models.Agent} model the agent
     */
    beforeSave(model) {
        model.set('modelConfig', { ...this.modelConfig });
        model.set('delegationScopes', this.selectedScopes.map((scope) => scope.value));
        if (model.isNew) {
            model.set('accountStatus', this.active ? 'active' : 'inactive');
        }
    }

    /**
     * Saves what lives on the agent's user: its status, role assignments and project memberships. When one of
     * them fails it rejects with the names of the failed steps in `failedSteps` and the first failure in `cause`.
     *
     * @method afterSave
     * @param {Prometheus.Models.Agent} agent the saved agent
     * @return {Promise}
     */
    async afterSave(agent) {
        let userId = agent.userId;
        let status = this.active ? 'active' : 'inactive';
        let steps = {};

        if (agent.user && agent.user.accountStatus !== status) {
            agent.user.set('accountStatus', status);
            steps.status = [agent.user.save()];
        }
        steps.roles = this.syncMembers('userrole', 'roleId', this.selectedRoles, this.current.userroles, userId);
        steps.projects = this.syncMembers('membership', 'projectId', this.selectedProjects, this.current.memberships, userId);

        let names = Object.keys(steps);
        let results = await Promise.all(names.map((name) => Promise.allSettled(steps[name])));
        let failedSteps = names.filter((name, index) => results[index].some((result) => result.status === 'rejected'));

        if (failedSteps.length) {
            let cause = results.flat().find((result) => result.status === 'rejected').reason;
            throw Object.assign(new Error('afterSave failed'), { failedSteps, cause });
        }
    }

    /**
     * Makes the user's records of one kind match the selection: creates the added ones, deletes the removed ones.
     *
     * @method syncMembers
     * @param {String} modelName `userrole` or `membership`
     * @param {String} field the attribute holding the chosen id
     * @param {Array} selected the chosen options
     * @param {Array} existing the records the user has
     * @param {String} userId the agent's user
     * @return {Array<Promise>}
     */
    syncMembers(modelName, field, selected, existing, userId) {
        let chosen = selected.map((option) => option.value);
        let added = chosen.filter((id) => !existing.some((record) => record[field] === id));
        let removed = existing.filter((record) => !chosen.includes(record[field]));

        return [
            ...added.map((id) => this.store.createRecord(modelName, { userId, [field]: id }).save()),
            ...removed.map((record) => record.destroyRecord())
        ];
    }

    /**
     * @method getSuccessMessage
     * @param {Prometheus.Models.Agent} agent the saved agent
     * @return {String}
     */
    getSuccessMessage(agent) {
        return this.intl.t('views.app.agent.saved', { name: agent.name, htmlSafe: true });
    }

    /**
     * @method getAfterSaveErrorMessage
     * @param {Prometheus.Models.Agent} agent the saved agent
     * @param {Object} error the error with the `failedSteps` of `afterSave`
     * @return {String}
     */
    getAfterSaveErrorMessage(agent, error) {
        let failedSteps = error?.failedSteps ?? [];
        if (!failedSteps.length) {
            return super.getAfterSaveErrorMessage(agent, error);
        }
        let steps = failedSteps.map((step) => this.intl.t(`views.app.agent.saveStep.${step}`)).join(', ');
        return this.intl.t('views.app.agent.savedWithErrors', { name: agent.name, steps });
    }

    /**
     * @method navigateToSuccess
     * @param {Prometheus.Models.Agent} agent the saved agent
     */
    navigateToSuccess(agent) {
        this.router.transitionTo('app.agent.page', agent.id);
    }

    /**
     * @method afterCancel
     */
    afterCancel() {
        if (this.isEdit) {
            this.router.transitionTo('app.agent.page', this.model.id);
        } else {
            this.router.transitionTo('app.agent.index');
        }
    }
}
