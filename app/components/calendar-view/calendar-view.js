/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { cached } from '@glimmer/tracking';

/**
 * Main Calendar View Component
 *
 * @class CalendarViewComponent
 * @namespace Prometheus.Components
 * @extends Glimmer.Component
 * @author Hammad Hassan <hammad@projects4.me>
 */
export default class CalendarViewComponent extends Component {
    @service calendarState;
    @service store;
    @service notifications;
    @service intl;

    @tracked isLoading = false;
    @tracked error = null;

    /**
     * Get filtered issues for the current calendar period
     */
    @cached
    get filteredIssues() {
        if (!this.args.issues) {
            return [];
        }

        const { activeFilters } = this.calendarState;
        const { periodStart, periodEnd } = this.calendarState;

        return this.args.issues.filter(issue => {
            // Date range filter
            if (!this.isIssueInDateRange(issue, periodStart, periodEnd)) {
                return false;
            }

            // My Issues filter
            if (activeFilters.showMyIssues && this.isMyIssue(issue)) {
                return true;
            }

            // Project Issues filter
            if (activeFilters.showProjectIssues && !this.isMyIssue(issue)) {
                // Apply additional filters for project issues
                return this.passesProjectFilters(issue, activeFilters);
            }

            return false;
        });
    }

    /**
     * Get filtered milestones for the current calendar period
     */
    @cached
    get filteredMilestones() {
        if (!this.args.project?.milestones || !this.calendarState.activeFilters.showMilestones) {
            return [];
        }

        const { periodStart, periodEnd } = this.calendarState;

        return this.args.project.milestones.filter(milestone => {
            return this.isMilestoneInDateRange(milestone, periodStart, periodEnd);
        });
    }

    /**
     * Get issues grouped by date for calendar display
     */
    @cached
    get issuesByDate() {
        const issuesByDate = new Map();

        this.filteredIssues.forEach(issue => {
            const dates = this.getIssueDateRange(issue);
            
            dates.forEach(date => {
                const dateKey = this.getDateKey(date);
                
                if (!issuesByDate.has(dateKey)) {
                    issuesByDate.set(dateKey, []);
                }
                
                issuesByDate.get(dateKey).push({
                    issue,
                    isStart: this.isSameDate(date, new Date(issue.startDate)),
                    isEnd: this.isSameDate(date, new Date(issue.endDate || issue.startDate)),
                    isMiddle: !this.isSameDate(date, new Date(issue.startDate)) && 
                             !this.isSameDate(date, new Date(issue.endDate || issue.startDate))
                });
            });
        });

        return issuesByDate;
    }

    /**
     * Get milestones grouped by date
     */
    @cached
    get milestonesByDate() {
        const milestonesByDate = new Map();

        this.filteredMilestones.forEach(milestone => {
            const date = new Date(milestone.startDate || milestone.endDate);
            const dateKey = this.getDateKey(date);
            
            if (!milestonesByDate.has(dateKey)) {
                milestonesByDate.set(dateKey, []);
            }
            
            milestonesByDate.get(dateKey).push(milestone);
        });

        return milestonesByDate;
    }

    /**
     * Check if an issue is in the given date range
     */
    isIssueInDateRange(issue, startDate, endDate) {
        if (!issue.startDate) {
            return false;
        }

        const issueStart = new Date(issue.startDate);
        const issueEnd = new Date(issue.endDate || issue.startDate);

        // Issue overlaps with the period if:
        // Issue starts before period ends AND issue ends after period starts
        return issueStart <= endDate && issueEnd >= startDate;
    }

    /**
     * Check if a milestone is in the given date range
     */
    isMilestoneInDateRange(milestone, startDate, endDate) {
        const milestoneDate = new Date(milestone.startDate || milestone.endDate);
        return milestoneDate >= startDate && milestoneDate <= endDate;
    }

    /**
     * Check if an issue belongs to the current user
     */
    isMyIssue(issue) {
        const currentUserId = this.args.currentUser?.id;
        return issue.assignee === currentUserId || 
               issue.owner === currentUserId ||
               issue.createdUser === currentUserId;
    }

    /**
     * Check if an issue passes project-level filters
     */
    passesProjectFilters(issue, filters) {
        // Priority filter
        if (filters.priorities.length > 0 && !filters.priorities.includes(issue.priority)) {
            return false;
        }

        // Status filter
        if (filters.statuses.length > 0) {
            const statusName = issue.issuestatus?.get?.('name') || issue.status;
            if (!filters.statuses.includes(statusName)) {
                return false;
            }
        }

        // Assignee filter
        if (filters.assignees.length > 0 && !filters.assignees.includes(issue.assignee)) {
            return false;
        }

        // Issue type filter
        if (filters.issueTypes.length > 0) {
            const typeName = issue.issuetype?.get?.('name') || issue.typeId;
            if (!filters.issueTypes.includes(typeName)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Get all dates that an issue spans
     */
    getIssueDateRange(issue) {
        const dates = [];
        const startDate = new Date(issue.startDate);
        const endDate = new Date(issue.endDate || issue.startDate);
        
        const current = new Date(startDate);
        while (current <= endDate) {
            dates.push(new Date(current));
            current.setDate(current.getDate() + 1);
        }
        
        return dates;
    }

    /**
     * Get a string key for a date (YYYY-MM-DD)
     */
    getDateKey(date) {
        return date.toISOString().split('T')[0];
    }

    /**
     * Check if two dates are the same day
     */
    isSameDate(date1, date2) {
        return this.getDateKey(date1) === this.getDateKey(date2);
    }

    /**
     * Get issues for a specific date
     */
    getIssuesForDate(date) {
        const dateKey = this.getDateKey(date);
        return this.issuesByDate.get(dateKey) || [];
    }

    /**
     * Get milestones for a specific date
     */
    getMilestonesForDate(date) {
        const dateKey = this.getDateKey(date);
        return this.milestonesByDate.get(dateKey) || [];
    }

    /**
     * Handle date cell click for issue creation
     */
    @action
    handleDateClick(date, event) {
        // Prevent if clicking on an existing issue or milestone
        if (event.target.closest('.calendar-event')) {
            return;
        }

        this.calendarState.startIssueCreation(date);
    }

    /**
     * Handle issue click
     */
    @action
    handleIssueClick(issue, event) {
        event.stopPropagation();
        this.calendarState.selectIssue(issue);
        
        if (this.args.onIssueSelect) {
            this.args.onIssueSelect(issue);
        }
    }

    /**
     * Handle issue double click for editing
     */
    @action
    handleIssueDoubleClick(issue, event) {
        event.stopPropagation();
        
        if (this.args.onIssueEdit) {
            this.args.onIssueEdit(issue);
        }
    }

    /**
     * Handle milestone click
     */
    @action
    handleMilestoneClick(milestone, event) {
        event.stopPropagation();
        
        if (this.args.onMilestoneSelect) {
            this.args.onMilestoneSelect(milestone);
        }
    }

    /**
     * Handle issue drag start
     */
    @action
    handleIssueDragStart(issue, event) {
        if (!this.canEditIssue(issue)) {
            event.preventDefault();
            return;
        }

        event.dataTransfer.setData('text/plain', issue.id);
        event.dataTransfer.effectAllowed = 'move';
        
        // Store original dates for potential rollback
        this.originalStartDate = issue.startDate;
        this.originalEndDate = issue.endDate;
    }

    /**
     * Handle issue drop on a date
     */
    @action
    async handleIssueDrop(date, event) {
        event.preventDefault();
        
        const issueId = event.dataTransfer.getData('text/plain');
        const issue = this.filteredIssues.find(i => i.id === issueId);
        
        if (!issue || !this.canEditIssue(issue)) {
            return;
        }

        try {
            await this.moveIssueToDate(issue, date);
            this.notifications.success(this.intl.t('calendar.issue_moved_successfully'));
        } catch (error) {
            this.notifications.error(this.intl.t('calendar.issue_move_failed'));
            console.error('Failed to move issue:', error);
        }
    }

    /**
     * Move an issue to a new date
     */
    async moveIssueToDate(issue, newStartDate) {
        const originalStart = new Date(issue.startDate);
        const originalEnd = new Date(issue.endDate || issue.startDate);
        const duration = Math.ceil((originalEnd - originalStart) / (1000 * 60 * 60 * 24));
        
        const newStart = new Date(newStartDate);
        const newEnd = new Date(newStart);
        newEnd.setDate(newEnd.getDate() + duration);
        
        // Update issue dates
        issue.startDate = this.calendarState.convertFromUserTimezone(this.getDateKey(newStart));
        issue.endDate = this.calendarState.convertFromUserTimezone(this.getDateKey(newEnd));
        
        // Save the issue
        await issue.save();
        
        if (this.args.onIssueUpdate) {
            this.args.onIssueUpdate(issue);
        }
    }

    /**
     * Check if user can edit an issue
     */
    canEditIssue(issue) {
        // This would integrate with the existing ACL system
        // For now, simplified check
        return this.isMyIssue(issue) || this.args.canEditAllIssues;
    }

    /**
     * Handle drag over for drop zones
     */
    @action
    handleDragOver(event) {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }

    /**
     * Handle new issue creation
     */
    @action
    async handleIssueCreate(issueData) {
        try {
            this.isLoading = true;
            
            const issue = this.store.createRecord('issue', {
                ...issueData,
                projectId: this.args.project.id,
                startDate: this.calendarState.convertFromUserTimezone(
                    this.getDateKey(this.calendarState.newIssueDate)
                )
            });
            
            await issue.save();
            
            this.calendarState.cancelIssueCreation();
            this.notifications.success(this.intl.t('calendar.issue_created_successfully'));
            
            if (this.args.onIssueCreate) {
                this.args.onIssueCreate(issue);
            }
            
        } catch (error) {
            this.notifications.error(this.intl.t('calendar.issue_creation_failed'));
            console.error('Failed to create issue:', error);
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
            
            Object.assign(issue, updates);
            await issue.save();
            
            this.notifications.success(this.intl.t('calendar.issue_updated_successfully'));
            
            if (this.args.onIssueUpdate) {
                this.args.onIssueUpdate(issue);
            }
            
        } catch (error) {
            this.notifications.error(this.intl.t('calendar.issue_update_failed'));
            console.error('Failed to update issue:', error);
        } finally {
            this.isLoading = false;
        }
    }
}
