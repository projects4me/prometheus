/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

/**
 * Calendar Sidebar Component for filters and saved searches
 *
 * @class CalendarSidebarComponent
 * @namespace Prometheus.Components
 * @extends Glimmer.Component
 * @author Hammad Hassan <hammad@projects4.me>
 */
export default class CalendarSidebarComponent extends Component {
    @service intl;
    @service currentUser;

    @tracked isCollapsed = false;
    @tracked showSavedSearchForm = false;
    @tracked newSearchName = '';
    @tracked expandedSections = {
        quickFilters: true,
        priorities: false,
        statuses: false,
        assignees: false,
        issueTypes: false,
        savedSearches: true
    };

    /**
     * Get available priorities from project
     */
    get availablePriorities() {
        return [
            { value: 'high', label: this.intl.t('calendar.priority.high'), color: '#e74c3c' },
            { value: 'medium', label: this.intl.t('calendar.priority.medium'), color: '#f39c12' },
            { value: 'low', label: this.intl.t('calendar.priority.low'), color: '#27ae60' }
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
            value: status.get('name'),
            label: status.get('displayName') || status.get('name'),
            color: status.get('color') || '#6c757d'
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
            label: user.get('name') || user.get('username'),
            avatar: user.get('avatar'),
            initials: this.getUserInitials(user)
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
            value: type.get('name'),
            label: type.get('displayName') || type.get('name'),
            icon: type.get('icon') || 'circle',
            color: type.get('color') || '#6c757d'
        }));
    }

    /**
     * Get user initials for display
     */
    getUserInitials(user) {
        const name = user.get('name') || user.get('username') || '';
        return name.split(' ')
            .map(part => part.charAt(0).toUpperCase())
            .slice(0, 2)
            .join('');
    }

    /**
     * Check if a filter value is active
     */
    isFilterActive(filterType, value) {
        const activeFilters = this.args.activeFilters;
        
        if (Array.isArray(activeFilters[filterType])) {
            return activeFilters[filterType].includes(value);
        }
        
        return activeFilters[filterType] === value;
    }

    /**
     * Get count of active filters
     */
    get activeFilterCount() {
        const filters = this.args.activeFilters;
        let count = 0;
        
        // Count boolean filters
        if (filters.showMyIssues) count++;
        if (filters.showProjectIssues) count++;
        if (filters.showMilestones) count++;
        
        // Count array filters
        count += filters.priorities.length;
        count += filters.statuses.length;
        count += filters.assignees.length;
        count += filters.issueTypes.length;
        
        return count;
    }

    /**
     * Check if section is expanded
     */
    isSectionExpanded(section) {
        return this.expandedSections[section];
    }

    /**
     * Toggle sidebar collapse
     */
    @action
    toggleCollapse() {
        this.isCollapsed = !this.isCollapsed;
    }

    /**
     * Toggle section expansion
     */
    @action
    toggleSection(section) {
        this.expandedSections = {
            ...this.expandedSections,
            [section]: !this.expandedSections[section]
        };
    }

    /**
     * Handle quick filter toggle
     */
    @action
    handleQuickFilterToggle(filterType) {
        if (this.args.onToggleFilter) {
            this.args.onToggleFilter(filterType);
        }
    }

    /**
     * Handle filter value toggle
     */
    @action
    handleFilterToggle(filterType, value) {
        if (this.args.onToggleFilter) {
            this.args.onToggleFilter(filterType, value);
        }
    }

    /**
     * Clear all filters
     */
    @action
    clearAllFilters() {
        const clearedFilters = {
            showMyIssues: false,
            showProjectIssues: false,
            showMilestones: false,
            priorities: [],
            statuses: [],
            assignees: [],
            issueTypes: []
        };
        
        if (this.args.onFilterChange) {
            this.args.onFilterChange(clearedFilters);
        }
    }

    /**
     * Reset to default filters
     */
    @action
    resetToDefaults() {
        const defaultFilters = {
            showMyIssues: true,
            showProjectIssues: true,
            showMilestones: true,
            priorities: ['high', 'medium', 'low'],
            statuses: [],
            assignees: [],
            issueTypes: []
        };
        
        if (this.args.onFilterChange) {
            this.args.onFilterChange(defaultFilters);
        }
    }

    /**
     * Show saved search form
     */
    @action
    showSaveSearchForm() {
        this.showSavedSearchForm = true;
        this.newSearchName = '';
    }

    /**
     * Hide saved search form
     */
    @action
    hideSaveSearchForm() {
        this.showSavedSearchForm = false;
        this.newSearchName = '';
    }

    /**
     * Handle search name input
     */
    @action
    handleSearchNameInput(event) {
        this.newSearchName = event.target.value;
    }

    /**
     * Save current filters as a search
     */
    @action
    saveCurrentSearch() {
        if (!this.newSearchName.trim()) {
            return;
        }
        
        if (this.args.onSavedSearchAdd) {
            this.args.onSavedSearchAdd(this.newSearchName.trim(), this.args.activeFilters);
        }
        
        this.hideSaveSearchForm();
    }

    /**
     * Apply a saved search
     */
    @action
    applySavedSearch(search) {
        if (this.args.onSavedSearchApply) {
            this.args.onSavedSearchApply(search);
        }
    }

    /**
     * Remove a saved search
     */
    @action
    removeSavedSearch(search) {
        if (this.args.onSavedSearchRemove) {
            this.args.onSavedSearchRemove(search.id);
        }
    }

    /**
     * Handle keyboard events in search form
     */
    @action
    handleSearchFormKeyDown(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            this.saveCurrentSearch();
        } else if (event.key === 'Escape') {
            event.preventDefault();
            this.hideSaveSearchForm();
        }
    }

    /**
     * Get my calendar filter (issues assigned to current user)
     */
    @action
    applyMyCalendarFilter() {
        const myUserId = this.currentUser.user?.id;
        if (!myUserId) return;
        
        const myCalendarFilters = {
            showMyIssues: true,
            showProjectIssues: false,
            showMilestones: true,
            priorities: ['high', 'medium', 'low'],
            statuses: [],
            assignees: [myUserId],
            issueTypes: []
        };
        
        if (this.args.onFilterChange) {
            this.args.onFilterChange(myCalendarFilters);
        }
    }

    /**
     * Get project calendar filter (all project issues)
     */
    @action
    applyProjectCalendarFilter() {
        const projectCalendarFilters = {
            showMyIssues: true,
            showProjectIssues: true,
            showMilestones: true,
            priorities: ['high', 'medium', 'low'],
            statuses: [],
            assignees: [],
            issueTypes: []
        };
        
        if (this.args.onFilterChange) {
            this.args.onFilterChange(projectCalendarFilters);
        }
    }

    /**
     * Check if current filters match "My Calendar"
     */
    get isMyCalendarActive() {
        const filters = this.args.activeFilters;
        const myUserId = this.currentUser.user?.id;
        
        return filters.showMyIssues && 
               !filters.showProjectIssues && 
               filters.assignees.length === 1 && 
               filters.assignees.includes(myUserId);
    }

    /**
     * Check if current filters match "Project Calendar"
     */
    get isProjectCalendarActive() {
        const filters = this.args.activeFilters;
        
        return filters.showMyIssues && 
               filters.showProjectIssues && 
               filters.assignees.length === 0;
    }
}
