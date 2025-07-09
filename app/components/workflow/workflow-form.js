/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Changeset from 'ember-changeset';
import { lookupValidator } from 'validated-changeset';

/**
 * Workflow Form Component
 * Handles workflow creation and editing with validation
 *
 * @class WorkflowWorkflowFormComponent
 * @namespace Prometheus.Components
 * @extends Component
 */
export default class WorkflowWorkflowFormComponent extends Component {
    @service store;
    @service flashMessages;
    @service currentUser;
    @service acl;

    @tracked isLoading = false;
    @tracked changeset;

    constructor() {
        super(...arguments);
        this.initializeChangeset();
    }

    /**
     * Initialize the changeset for form validation
     *
     * @method initializeChangeset
     * @private
     */
    initializeChangeset() {
        const workflow = this.args.workflow || this.store.createRecord('workflow-definition', {
            name: '',
            description: '',
            version: '1.0',
            isActive: true,
            isSystem: false,
            projectId: this.args.projectId,
            createdUser: this.currentUser?.id,
            modifiedUser: this.currentUser?.id
        });

        this.changeset = new Changeset(workflow, lookupValidator(workflow.constructor), {
            name: { presence: true },
            description: { presence: true }
        });
    }

    /**
     * Save the workflow
     *
     * @method save
     * @public
     */
    @action async save() {
        if (this.changeset.isValid()) {
            this.isLoading = true;
            
            try {
                await this.changeset.save();
                
                this.flashMessages.success(
                    `Workflow "${this.changeset.get('name')}" saved successfully`
                );
                
                // Call the onSave action if provided
                if (this.args.onSave) {
                    this.args.onSave(this.changeset);
                }
            } catch (error) {
                console.error('Error saving workflow:', error);
                this.flashMessages.error('Failed to save workflow');
            } finally {
                this.isLoading = false;
            }
        } else {
            this.changeset.validate();
            this.flashMessages.error('Please fix the validation errors');
        }
    }

    /**
     * Cancel the form
     *
     * @method cancel
     * @public
     */
    @action cancel() {
        if (this.args.onCancel) {
            this.args.onCancel();
        }
    }

    /**
     * Reset the form
     *
     * @method reset
     * @public
     */
    @action reset() {
        this.changeset.rollback();
        this.flashMessages.info('Form reset to original values');
    }

    /**
     * Update a field value
     *
     * @method updateField
     * @param {String} field The field name
     * @param {*} value The new value
     * @public
     */
    @action updateField(field, value) {
        this.changeset.set(field, value);
    }

    /**
     * Toggle the active status
     *
     * @method toggleActive
     * @public
     */
    @action toggleActive() {
        const currentValue = this.changeset.get('isActive');
        this.changeset.set('isActive', !currentValue);
    }

    /**
     * Toggle the system workflow status
     *
     * @method toggleSystem
     * @public
     */
    @action toggleSystem() {
        const currentValue = this.changeset.get('isSystem');
        this.changeset.set('isSystem', !currentValue);
    }

    /**
     * Get validation errors for a field
     *
     * @method getFieldErrors
     * @param {String} field The field name
     * @return {Array} Array of error messages
     * @public
     */
    getFieldErrors(field) {
        return this.changeset.get(`errors.${field}`);
    }

    /**
     * Check if a field has errors
     *
     * @method hasFieldErrors
     * @param {String} field The field name
     * @return {Boolean} True if field has errors
     * @public
     */
    hasFieldErrors(field) {
        return this.getFieldErrors(field)?.length > 0;
    }

    /**
     * Get the first error message for a field
     *
     * @method getFieldError
     * @param {String} field The field name
     * @return {String} First error message
     * @public
     */
    getFieldError(field) {
        const errors = this.getFieldErrors(field);
        return errors?.[0]?.message;
    }

    /**
     * Check if the form is valid
     *
     * @method get isValid
     * @return {Boolean} True if form is valid
     * @public
     */
    get isValid() {
        return this.changeset.isValid();
    }

    /**
     * Check if the form has changes
     *
     * @method get hasChanges
     * @return {Boolean} True if form has changes
     * @public
     */
    get hasChanges() {
        return this.changeset.isDirty;
    }

    /**
     * Check if user can edit workflows
     *
     * @method get canEdit
     * @return {Boolean} Whether user can edit workflows
     * @public
     */
    get canEdit() {
        return this.args.canEdit !== false && 
               (this.args.isEditing ? 
                this.acl.checkAccess('App.Project.Workflow.Edit') : 
                this.acl.checkAccess('App.Project.Workflow.Create'));
    }

    /**
     * Check if user can modify system workflows
     *
     * @method get canEditSystem
     * @return {Boolean} Whether user can edit system workflows
     * @public
     */
    get canEditSystem() {
        return this.acl.checkAccess('App.System.Workflow.Edit');
    }

    /**
     * Check if workflow is system workflow and user cannot edit it
     *
     * @method get isSystemWorkflowReadOnly
     * @return {Boolean} Whether system workflow is read-only for current user
     * @public
     */
    get isSystemWorkflowReadOnly() {
        return this.changeset?.get('isSystem') && !this.canEditSystem;
    }
}
