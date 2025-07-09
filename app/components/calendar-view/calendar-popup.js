/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

/**
 * Calendar Popup Component for issue creation and editing
 *
 * @class CalendarPopupComponent
 * @namespace Prometheus.Components
 * @extends Glimmer.Component
 * @author Hammad Hassan <hammad@projects4.me>
 */
export default class CalendarPopupComponent extends Component {
    @service intl;
    @service currentUser;

    @tracked formData = {};
    @tracked errors = {};
    @tracked isSubmitting = false;

    constructor() {
        super(...arguments);
        this.initializeFormData();
    }

    /**
     * Initialize form data based on mode
     */
    initializeFormData() {
        if (this.args.mode === 'create') {
            this.formData = {
                subject: '',
                description: '',
                priority: 'medium',
                startDate: this.formatDateForInput(this.args.date),
                endDate: this.formatDateForInput(this.args.date),
                assignee: this.currentUser.user?.id || '',
                statusId: '',
                typeId: '',
                estimatedHours: ''
            };
        } else if (this.args.mode === 'edit' && this.args.issue) {
            const issue = this.args.issue;
            this.formData = {
                subject: issue.subject || '',
                description: issue.description || '',
                priority: issue.priority || 'medium',
                startDate: this.formatDateForInput(issue.startDate),
                endDate: this.formatDateForInput(issue.endDate || issue.startDate),
                assignee: issue.assignee || '',
                statusId: issue.statusId || '',
                typeId: issue.typeId || '',
                estimatedHours: this.getEstimatedHours(issue)
            };
        }
    }

    /**
     * Format date for HTML input
     */
    formatDateForInput(date) {
        if (!date) return '';
        
        const d = new Date(date);
        return d.toISOString().split('T')[0];
    }

    /**
     * Get estimated hours from issue
     */
    getEstimatedHours(issue) {
        if (!issue.estimated) return '';
        
        const totalHours = issue.estimated.reduce((sum, timelog) => {
            return sum + (parseFloat(timelog.get('hours')) || 0);
        }, 0);
        
        return totalHours > 0 ? totalHours.toString() : '';
    }

    /**
     * Get available priorities
     */
    get availablePriorities() {
        return [
            { value: 'high', label: this.intl.t('calendar.priority.high') },
            { value: 'medium', label: this.intl.t('calendar.priority.medium') },
            { value: 'low', label: this.intl.t('calendar.priority.low') }
        ];
    }

    /**
     * Get available statuses from project
     */
    get availableStatuses() {
        if (!this.args.project?.issuestatuses) {
            return [];
        }

        return this.args.project.issuestatuses.map(status => ({
            value: status.get('id'),
            label: status.get('displayName') || status.get('name')
        }));
    }

    /**
     * Get available issue types from project
     */
    get availableIssueTypes() {
        if (!this.args.project?.issuetypes) {
            return [];
        }

        return this.args.project.issuetypes.map(type => ({
            value: type.get('id'),
            label: type.get('displayName') || type.get('name')
        }));
    }

    /**
     * Get available assignees from project
     */
    get availableAssignees() {
        if (!this.args.project?.members) {
            return [];
        }

        return this.args.project.members.map(user => ({
            value: user.get('id'),
            label: user.get('name') || user.get('username')
        }));
    }

    /**
     * Get popup title based on mode
     */
    get popupTitle() {
        if (this.args.mode === 'create') {
            return this.intl.t('calendar.create_issue');
        } else if (this.args.mode === 'edit') {
            return this.intl.t('calendar.edit_issue');
        }
        return '';
    }

    /**
     * Get submit button text based on mode
     */
    get submitButtonText() {
        if (this.isSubmitting) {
            return this.intl.t('calendar.saving');
        }
        
        if (this.args.mode === 'create') {
            return this.intl.t('calendar.create_issue');
        } else if (this.args.mode === 'edit') {
            return this.intl.t('calendar.update_issue');
        }
        return this.intl.t('calendar.save');
    }

    /**
     * Check if form is valid
     */
    get isFormValid() {
        return this.formData.subject && 
               this.formData.subject.trim().length > 0 &&
               this.formData.startDate &&
               Object.keys(this.errors).length === 0;
    }

    /**
     * Check if user can edit (for edit mode)
     */
    get canEdit() {
        return this.args.mode === 'create' || this.args.canEdit;
    }

    /**
     * Handle form field change
     */
    @action
    handleFieldChange(field, event) {
        const value = event.target.value;
        this.formData = { ...this.formData, [field]: value };
        
        // Clear error for this field
        if (this.errors[field]) {
            const newErrors = { ...this.errors };
            delete newErrors[field];
            this.errors = newErrors;
        }
        
        // Validate field
        this.validateField(field, value);
    }

    /**
     * Validate individual field
     */
    validateField(field, value) {
        const errors = { ...this.errors };
        
        switch (field) {
            case 'subject':
                if (!value || value.trim().length === 0) {
                    errors.subject = this.intl.t('calendar.validation.subject_required');
                } else if (value.trim().length > 255) {
                    errors.subject = this.intl.t('calendar.validation.subject_too_long');
                }
                break;
                
            case 'startDate':
                if (!value) {
                    errors.startDate = this.intl.t('calendar.validation.start_date_required');
                }
                break;
                
            case 'endDate':
                if (value && this.formData.startDate && new Date(value) < new Date(this.formData.startDate)) {
                    errors.endDate = this.intl.t('calendar.validation.end_date_before_start');
                }
                break;
                
            case 'estimatedHours':
                if (value && (isNaN(value) || parseFloat(value) < 0)) {
                    errors.estimatedHours = this.intl.t('calendar.validation.invalid_hours');
                }
                break;
        }
        
        this.errors = errors;
    }

    /**
     * Validate entire form
     */
    validateForm() {
        const errors = {};
        
        // Required fields
        if (!this.formData.subject || this.formData.subject.trim().length === 0) {
            errors.subject = this.intl.t('calendar.validation.subject_required');
        }
        
        if (!this.formData.startDate) {
            errors.startDate = this.intl.t('calendar.validation.start_date_required');
        }
        
        // Date validation
        if (this.formData.endDate && this.formData.startDate && 
            new Date(this.formData.endDate) < new Date(this.formData.startDate)) {
            errors.endDate = this.intl.t('calendar.validation.end_date_before_start');
        }
        
        // Estimated hours validation
        if (this.formData.estimatedHours && 
            (isNaN(this.formData.estimatedHours) || parseFloat(this.formData.estimatedHours) < 0)) {
            errors.estimatedHours = this.intl.t('calendar.validation.invalid_hours');
        }
        
        this.errors = errors;
        return Object.keys(errors).length === 0;
    }

    /**
     * Handle form submission
     */
    @action
    async handleSubmit(event) {
        event.preventDefault();
        
        if (!this.canEdit) {
            return;
        }
        
        if (!this.validateForm()) {
            return;
        }
        
        this.isSubmitting = true;
        
        try {
            // Convert timezone dates
            const issueData = {
                ...this.formData,
                subject: this.formData.subject.trim(),
                startDate: this.convertFromUserTimezone(this.formData.startDate),
                endDate: this.formData.endDate ? 
                    this.convertFromUserTimezone(this.formData.endDate) : 
                    this.convertFromUserTimezone(this.formData.startDate)
            };
            
            if (this.args.mode === 'create') {
                await this.args.onSave(issueData);
            } else if (this.args.mode === 'edit') {
                await this.args.onSave(this.args.issue, issueData);
            }
            
        } catch (error) {
            console.error('Form submission error:', error);
            // Error handling is done in parent component
        } finally {
            this.isSubmitting = false;
        }
    }

    /**
     * Convert user timezone date to UTC
     */
    convertFromUserTimezone(dateString) {
        if (!dateString) return null;
        
        // For now, simple conversion - in production would use proper timezone handling
        return dateString;
    }

    /**
     * Handle cancel action
     */
    @action
    handleCancel() {
        if (this.args.onCancel) {
            this.args.onCancel();
        }
    }

    /**
     * Handle backdrop click
     */
    @action
    handleBackdropClick(event) {
        if (event.target === event.currentTarget) {
            this.handleCancel();
        }
    }

    /**
     * Handle escape key
     */
    @action
    handleKeyDown(event) {
        if (event.key === 'Escape') {
            this.handleCancel();
        }
    }

    /**
     * Auto-set end date when start date changes
     */
    @action
    handleStartDateChange(event) {
        const startDate = event.target.value;
        this.formData = { 
            ...this.formData, 
            startDate,
            // Auto-set end date to same as start date if not set
            endDate: this.formData.endDate || startDate
        };
        
        this.validateField('startDate', startDate);
        
        // Re-validate end date if it exists
        if (this.formData.endDate) {
            this.validateField('endDate', this.formData.endDate);
        }
    }

    /**
     * Handle end date change
     */
    @action
    handleEndDateChange(event) {
        const endDate = event.target.value;
        this.formData = { ...this.formData, endDate };
        this.validateField('endDate', endDate);
    }

    /**
     * Set default status if none selected
     */
    @action
    setDefaultStatus() {
        if (!this.formData.statusId && this.availableStatuses.length > 0) {
            // Find 'new' status or use first available
            const newStatus = this.availableStatuses.find(s => 
                s.label.toLowerCase().includes('new') || 
                s.label.toLowerCase().includes('open')
            );
            
            this.formData = {
                ...this.formData,
                statusId: newStatus ? newStatus.value : this.availableStatuses[0].value
            };
        }
    }

    /**
     * Set default issue type if none selected
     */
    @action
    setDefaultIssueType() {
        if (!this.formData.typeId && this.availableIssueTypes.length > 0) {
            // Find 'task' type or use first available
            const taskType = this.availableIssueTypes.find(t => 
                t.label.toLowerCase().includes('task') || 
                t.label.toLowerCase().includes('story')
            );
            
            this.formData = {
                ...this.formData,
                typeId: taskType ? taskType.value : this.availableIssueTypes[0].value
            };
        }
    }
}
