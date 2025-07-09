/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

/**
 * Calendar Route for project calendar view
 *
 * @class CalendarRoute
 * @namespace Prometheus.Routes
 * @extends Ember.Route
 * @author Hammad Hassan <hammad@projects4.me>
 */
export default class CalendarRoute extends Route {
    @service store;
    @service calendarState;
    @service currentUser;
    @service trackedProject;

    /**
     * Load data for calendar view
     */
    async model() {
        const project = this.trackedProject.project;
        
        if (!project) {
            this.transitionTo('app.projects');
            return;
        }

        try {
            // Load project issues with relationships
            const issues = await this.store.query('issue', {
                projectId: project.id,
                include: 'assignedTo,createdBy,issuestatus,issuetype,milestone',
                // Load issues for a reasonable time range around current date
                startDate: this.getTimeRangeStart(),
                endDate: this.getTimeRangeEnd()
            });

            // Load project milestones
            const milestones = await project.milestones;

            // Load project members for assignee filtering
            const members = await project.members;

            // Load project issue statuses and types
            const issueStatuses = await project.issuestatuses;
            const issueTypes = await project.issuetypes;

            return {
                project,
                issues,
                milestones,
                members,
                issueStatuses,
                issueTypes
            };

        } catch (error) {
            console.error('Failed to load calendar data:', error);
            throw error;
        }
    }

    /**
     * Get start date for loading issues (3 months before current date)
     */
    getTimeRangeStart() {
        const date = new Date();
        date.setMonth(date.getMonth() - 3);
        return date.toISOString().split('T')[0];
    }

    /**
     * Get end date for loading issues (6 months after current date)
     */
    getTimeRangeEnd() {
        const date = new Date();
        date.setMonth(date.getMonth() + 6);
        return date.toISOString().split('T')[0];
    }

    /**
     * Setup controller with model data
     */
    setupController(controller, model) {
        super.setupController(controller, model);
        
        // Initialize calendar state if needed
        if (!this.calendarState.selectedTimezone) {
            this.calendarState.initializeUserPreferences();
        }
        
        // Set up controller properties
        controller.setProperties({
            project: model.project,
            issues: model.issues,
            milestones: model.milestones,
            members: model.members,
            issueStatuses: model.issueStatuses,
            issueTypes: model.issueTypes,
            currentUser: this.currentUser.user
        });
    }

    /**
     * Handle query parameter changes
     */
    queryParams = {
        view: { refreshModel: false },
        date: { refreshModel: false },
        filters: { refreshModel: false }
    };

    /**
     * Actions
     */
    actions = {
        /**
         * Refresh calendar data
         */
        refreshCalendar() {
            this.refresh();
        },

        /**
         * Load more issues for extended date range
         */
        async loadMoreIssues(startDate, endDate) {
            try {
                const additionalIssues = await this.store.query('issue', {
                    projectId: this.trackedProject.project.id,
                    include: 'assignedTo,createdBy,issuestatus,issuetype,milestone',
                    startDate: startDate.toISOString().split('T')[0],
                    endDate: endDate.toISOString().split('T')[0]
                });

                // Merge with existing issues (avoid duplicates)
                const controller = this.controller;
                const existingIssueIds = new Set(controller.issues.map(issue => issue.id));
                const newIssues = additionalIssues.filter(issue => !existingIssueIds.has(issue.id));
                
                controller.set('issues', [...controller.issues, ...newIssues]);
                
                return newIssues;
            } catch (error) {
                console.error('Failed to load additional issues:', error);
                throw error;
            }
        },

        /**
         * Handle error in calendar view
         */
        error(error) {
            console.error('Calendar route error:', error);
            
            // Show user-friendly error message
            this.notifications?.error('Failed to load calendar data. Please try again.');
            
            // Transition to project overview if critical error
            if (error.status === 404 || error.status === 403) {
                this.transitionTo('app.project.index');
            }
            
            return true; // Prevent error from bubbling up
        }
    };

    /**
     * Deactivate route - cleanup
     */
    deactivate() {
        super.deactivate();
        
        // Clear any temporary calendar state if needed
        // this.calendarState.clearTemporaryState();
    }
}
