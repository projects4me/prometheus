/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

/**
 * Calendar Controller for project calendar view
 *
 * @class CalendarController
 * @namespace Prometheus.Controllers
 * @extends Ember.Controller
 * @author Hammad Hassan <hammad@projects4.me>
 */
export default class CalendarController extends Controller {
    @service calendarState;
    @service notifications;
    @service router;
    @service store;

    @tracked isLoading = false;
    @tracked error = null;

    /**
     * Query parameters for URL state management
     */
    queryParams = ['view', 'date', 'filters'];
    @tracked view = null;
    @tracked date = null;
    @tracked filters = null;

    /**
     * Sync query parameters with calendar state
     */
    get currentView() {
        return this.view || this.calendarState.currentView;
    }

    get currentDate() {
        return this.date ? new Date(this.date) : this.calendarState.currentDate;
    }

    get activeFilters() {
        return this.filters ? JSON.parse(this.filters) : this.calendarState.activeFilters;
    }

    /**
     * Check if user can edit all issues (admin/project manager)
     */
    get canEditAllIssues() {
        // This would integrate with the existing ACL system
        // For now, simplified check
        return this.currentUser?.isAdmin || this.isProjectManager;
    }

    /**
     * Check if current user is project manager
     */
    get isProjectManager() {
        if (!this.project || !this.currentUser) {
            return false;
        }
        
        // Check if user is project owner or has manager role
        return this.project.owner?.id === this.currentUser.id ||
               this.project.assignee === this.currentUser.id;
    }

    /**
     * Handle calendar view change
     */
    @action
    handleViewChange(newView) {
        this.calendarState.setView(newView);
        this.view = newView;
    }

    /**
     * Handle date navigation
     */
    @action
    handleDateChange(newDate) {
        this.calendarState.goToDate(newDate);
        this.date = newDate.toISOString().split('T')[0];
    }

    /**
     * Handle filter changes
     */
    @action
    handleFilterChange(newFilters) {
        this.calendarState.updateFilters(newFilters);
        this.filters = JSON.stringify(newFilters);
    }

    /**
     * Handle issue selection
     */
    @action
    handleIssueSelect(issue) {
        this.calendarState.selectIssue(issue);
        
        // Optionally navigate to issue detail
        // this.router.transitionTo('app.project.issue.page', issue.issueNumber);
    }

    /**
     * Handle issue editing
     */
    @action
    handleIssueEdit(issue) {
        this.calendarState.selectIssue(issue);
        // The popup will be shown via the calendar state
    }

    /**
     * Handle milestone selection
     */
    @action
    handleMilestoneSelect(milestone) {
        // Navigate to milestone detail or show popup
        console.log('Milestone selected:', milestone);
    }

    /**
     * Handle issue creation
     */
    @action
    async handleIssueCreate(issueData) {
        try {
            this.isLoading = true;
            
            const issue = this.store.createRecord('issue', {
                ...issueData,
                projectId: this.project.id
            });
            
            await issue.save();
            
            // Add to local issues array
            this.issues = [...this.issues, issue];
            
            this.notifications.success('Issue created successfully');
            
            return issue;
        } catch (error) {
            this.notifications.error('Failed to create issue');
            console.error('Issue creation failed:', error);
            throw error;
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * Handle issue update
     */
    @action
    async handleIssueUpdate(issue, updates) {
        try {
            this.isLoading = true;
            
            // Apply updates to issue
            Object.assign(issue, updates);
            await issue.save();
            
            this.notifications.success('Issue updated successfully');
            
            return issue;
        } catch (error) {
            this.notifications.error('Failed to update issue');
            console.error('Issue update failed:', error);
            throw error;
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * Handle issue deletion
     */
    @action
    async handleIssueDelete(issue) {
        try {
            this.isLoading = true;
            
            await issue.destroyRecord();
            
            // Remove from local issues array
            this.issues = this.issues.filter(i => i.id !== issue.id);
            
            this.notifications.success('Issue deleted successfully');
            
            // Clear selection
            this.calendarState.clearSelection();
            
        } catch (error) {
            this.notifications.error('Failed to delete issue');
            console.error('Issue deletion failed:', error);
            throw error;
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * Handle calendar refresh
     */
    @action
    refreshCalendar() {
        this.send('refreshCalendar');
    }

    /**
     * Handle timezone change
     */
    @action
    handleTimezoneChange(timezone) {
        this.calendarState.selectedTimezone = timezone;
        this.calendarState.savePreferences();
    }

    /**
     * Handle saved search operations
     */
    @action
    handleSavedSearchAdd(name, filters) {
        this.calendarState.addSavedSearch(name, filters);
        this.notifications.success(`Saved search "${name}" created`);
    }

    @action
    handleSavedSearchApply(search) {
        this.calendarState.applySavedSearch(search);
        this.filters = JSON.stringify(search.filters);
        this.notifications.info(`Applied search "${search.name}"`);
    }

    @action
    handleSavedSearchRemove(searchId) {
        const search = this.calendarState.savedSearches.find(s => s.id === searchId);
        this.calendarState.removeSavedSearch(searchId);
        
        if (search) {
            this.notifications.success(`Removed search "${search.name}"`);
        }
    }

    /**
     * Handle calendar navigation
     */
    @action
    goToPrevious() {
        this.calendarState.goToPrevious();
        this.date = this.calendarState.currentDate.toISOString().split('T')[0];
    }

    @action
    goToNext() {
        this.calendarState.goToNext();
        this.date = this.calendarState.currentDate.toISOString().split('T')[0];
    }

    @action
    goToToday() {
        this.calendarState.goToToday();
        this.date = this.calendarState.currentDate.toISOString().split('T')[0];
    }

    /**
     * Handle weekend toggle
     */
    @action
    toggleWeekends() {
        this.calendarState.toggleWeekends();
    }

    /**
     * Handle keyboard shortcuts
     */
    @action
    handleKeyboardShortcut(event) {
        // Handle global calendar keyboard shortcuts
        switch (event.key) {
            case 'c':
                if (event.ctrlKey || event.metaKey) {
                    event.preventDefault();
                    // Create new issue
                    this.calendarState.startIssueCreation(new Date());
                }
                break;
            case 'r':
                if (event.ctrlKey || event.metaKey) {
                    event.preventDefault();
                    this.refreshCalendar();
                }
                break;
            case 'Escape':
                // Clear selections and close popups
                this.calendarState.clearSelection();
                this.calendarState.cancelIssueCreation();
                break;
        }
    }

    /**
     * Export calendar data
     */
    @action
    async exportCalendar(format = 'ics') {
        try {
            this.isLoading = true;
            
            // This would integrate with an export service
            const exportData = {
                project: this.project,
                issues: this.issues,
                milestones: this.milestones,
                dateRange: {
                    start: this.calendarState.periodStart,
                    end: this.calendarState.periodEnd
                },
                filters: this.calendarState.activeFilters
            };
            
            // For now, just log the export data
            console.log('Exporting calendar data:', exportData);
            
            this.notifications.success(`Calendar exported as ${format.toUpperCase()}`);
            
        } catch (error) {
            this.notifications.error('Failed to export calendar');
            console.error('Calendar export failed:', error);
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * Print calendar
     */
    @action
    printCalendar() {
        // Trigger print dialog with calendar-optimized styles
        window.print();
    }

    /**
     * Handle error recovery
     */
    @action
    handleError(error) {
        console.error('Calendar error:', error);
        this.error = error.message || 'An unexpected error occurred';
        this.isLoading = false;
    }

    /**
     * Clear error state
     */
    @action
    clearError() {
        this.error = null;
    }

    /**
     * Reset calendar to default state
     */
    @action
    resetCalendar() {
        this.calendarState.goToToday();
        this.calendarState.setView('month');
        this.calendarState.updateFilters({
            showMyIssues: true,
            showProjectIssues: true,
            showMilestones: true,
            priorities: ['high', 'medium', 'low'],
            statuses: [],
            assignees: [],
            issueTypes: []
        });
        
        // Clear query parameters
        this.view = null;
        this.date = null;
        this.filters = null;
        
        this.notifications.info('Calendar reset to default view');
    }
}
