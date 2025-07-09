/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

/**
 * Calendar State Service for managing calendar view state and user preferences
 *
 * @class CalendarStateService
 * @namespace Prometheus.Services
 * @extends Ember.Service
 * @author Hammad Hassan <hammad@projects4.me>
 */
export default class CalendarStateService extends Service {
    @service currentUser;
    @service settings;

    @tracked currentView = 'month'; // 'day', 'week', 'month'
    @tracked currentDate = new Date();
    @tracked selectedTimezone = null;
    @tracked showWeekends = true;
    @tracked selectedIssue = null;
    @tracked isCreatingIssue = false;
    @tracked newIssueDate = null;

    @tracked activeFilters = {
        showMyIssues: true,
        showProjectIssues: true,
        showMilestones: true,
        priorities: ['high', 'medium', 'low'],
        statuses: [],
        assignees: [],
        issueTypes: []
    };

    @tracked savedSearches = [];

    constructor() {
        super(...arguments);
        this.initializeUserPreferences();
    }

    /**
     * Initialize user preferences from settings or defaults
     */
    initializeUserPreferences() {
        // Get user's timezone preference or default to browser timezone
        this.selectedTimezone = this.currentUser.user?.timezone || 
                               Intl.DateTimeFormat().resolvedOptions().timeZone;
        
        // Load saved calendar preferences
        const savedPreferences = this.settings.get('calendarPreferences');
        if (savedPreferences) {
            this.currentView = savedPreferences.defaultView || 'month';
            this.showWeekends = savedPreferences.showWeekends !== false;
            this.activeFilters = { ...this.activeFilters, ...savedPreferences.filters };
        }
    }

    /**
     * Get the start of the current calendar period based on view
     */
    get periodStart() {
        const date = new Date(this.currentDate);
        
        switch (this.currentView) {
            case 'day':
                date.setHours(0, 0, 0, 0);
                return date;
            
            case 'week':
                const dayOfWeek = date.getDay();
                date.setDate(date.getDate() - dayOfWeek);
                date.setHours(0, 0, 0, 0);
                return date;
            
            case 'month':
            default:
                date.setDate(1);
                date.setHours(0, 0, 0, 0);
                // Go back to start of week containing first day of month
                const firstDayOfWeek = date.getDay();
                date.setDate(date.getDate() - firstDayOfWeek);
                return date;
        }
    }

    /**
     * Get the end of the current calendar period based on view
     */
    get periodEnd() {
        const date = new Date(this.currentDate);
        
        switch (this.currentView) {
            case 'day':
                date.setHours(23, 59, 59, 999);
                return date;
            
            case 'week':
                const dayOfWeek = date.getDay();
                date.setDate(date.getDate() + (6 - dayOfWeek));
                date.setHours(23, 59, 59, 999);
                return date;
            
            case 'month':
            default:
                // Get last day of month
                date.setMonth(date.getMonth() + 1, 0);
                date.setHours(23, 59, 59, 999);
                // Go forward to end of week containing last day of month
                const lastDayOfWeek = date.getDay();
                date.setDate(date.getDate() + (6 - lastDayOfWeek));
                return date;
        }
    }

    /**
     * Get calendar grid dates for current view
     */
    get calendarDates() {
        const dates = [];
        const current = new Date(this.periodStart);
        const end = this.periodEnd;

        while (current <= end) {
            dates.push(new Date(current));
            current.setDate(current.getDate() + 1);
        }

        return dates;
    }

    /**
     * Check if a date is in the current month (for month view styling)
     */
    isCurrentMonth(date) {
        return date.getMonth() === this.currentDate.getMonth() &&
               date.getFullYear() === this.currentDate.getFullYear();
    }

    /**
     * Check if a date is today
     */
    isToday(date) {
        const today = new Date();
        return date.getDate() === today.getDate() &&
               date.getMonth() === today.getMonth() &&
               date.getFullYear() === today.getFullYear();
    }

    /**
     * Convert a date to user's timezone
     */
    convertToUserTimezone(date) {
        if (!date) return null;
        
        const utcDate = new Date(date);
        return new Intl.DateTimeFormat('en-CA', {
            timeZone: this.selectedTimezone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).format(utcDate);
    }

    /**
     * Convert user timezone date back to UTC
     */
    convertFromUserTimezone(dateString) {
        if (!dateString) return null;
        
        // Create date in user's timezone
        const date = new Date(dateString + 'T00:00:00');
        
        // Convert to UTC
        const utcDate = new Date(date.getTime() + (date.getTimezoneOffset() * 60000));
        return utcDate.toISOString().split('T')[0];
    }

    /**
     * Change calendar view
     */
    @action
    setView(view) {
        this.currentView = view;
        this.savePreferences();
    }

    /**
     * Navigate to specific date
     */
    @action
    goToDate(date) {
        this.currentDate = new Date(date);
    }

    /**
     * Navigate to today
     */
    @action
    goToToday() {
        this.currentDate = new Date();
    }

    /**
     * Navigate to previous period
     */
    @action
    goToPrevious() {
        const date = new Date(this.currentDate);
        
        switch (this.currentView) {
            case 'day':
                date.setDate(date.getDate() - 1);
                break;
            case 'week':
                date.setDate(date.getDate() - 7);
                break;
            case 'month':
                date.setMonth(date.getMonth() - 1);
                break;
        }
        
        this.currentDate = date;
    }

    /**
     * Navigate to next period
     */
    @action
    goToNext() {
        const date = new Date(this.currentDate);
        
        switch (this.currentView) {
            case 'day':
                date.setDate(date.getDate() + 1);
                break;
            case 'week':
                date.setDate(date.getDate() + 7);
                break;
            case 'month':
                date.setMonth(date.getMonth() + 1);
                break;
        }
        
        this.currentDate = date;
    }

    /**
     * Toggle weekend display
     */
    @action
    toggleWeekends() {
        this.showWeekends = !this.showWeekends;
        this.savePreferences();
    }

    /**
     * Update active filters
     */
    @action
    updateFilters(filters) {
        this.activeFilters = { ...this.activeFilters, ...filters };
        this.savePreferences();
    }

    /**
     * Toggle filter option
     */
    @action
    toggleFilter(filterType, value) {
        if (Array.isArray(this.activeFilters[filterType])) {
            const currentValues = [...this.activeFilters[filterType]];
            const index = currentValues.indexOf(value);
            
            if (index > -1) {
                currentValues.splice(index, 1);
            } else {
                currentValues.push(value);
            }
            
            this.activeFilters[filterType] = currentValues;
        } else {
            this.activeFilters[filterType] = !this.activeFilters[filterType];
        }
        
        this.savePreferences();
    }

    /**
     * Start issue creation process
     */
    @action
    startIssueCreation(date) {
        this.isCreatingIssue = true;
        this.newIssueDate = date;
    }

    /**
     * Cancel issue creation
     */
    @action
    cancelIssueCreation() {
        this.isCreatingIssue = false;
        this.newIssueDate = null;
    }

    /**
     * Select an issue
     */
    @action
    selectIssue(issue) {
        this.selectedIssue = issue;
    }

    /**
     * Clear issue selection
     */
    @action
    clearSelection() {
        this.selectedIssue = null;
    }

    /**
     * Save user preferences
     */
    savePreferences() {
        const preferences = {
            defaultView: this.currentView,
            showWeekends: this.showWeekends,
            filters: this.activeFilters
        };
        
        this.settings.set('calendarPreferences', preferences);
    }

    /**
     * Add a saved search
     */
    @action
    addSavedSearch(name, filters) {
        const search = {
            id: Date.now().toString(),
            name,
            filters: { ...filters },
            createdAt: new Date().toISOString()
        };
        
        this.savedSearches = [...this.savedSearches, search];
        this.savePreferences();
    }

    /**
     * Remove a saved search
     */
    @action
    removeSavedSearch(searchId) {
        this.savedSearches = this.savedSearches.filter(search => search.id !== searchId);
        this.savePreferences();
    }

    /**
     * Apply a saved search
     */
    @action
    applySavedSearch(search) {
        this.activeFilters = { ...search.filters };
    }
}
