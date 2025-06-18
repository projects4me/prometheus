/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

/**
 * Gantt Chart Route for Project
 * Loads project data with issues and milestones for Gantt chart visualization
 *
 * @class AppProjectGanttRoute
 * @namespace Prometheus.Routes
 * @extends Ember.Route
 * @author Hammad Hassan <hammad@projects4.me>
 */
export default class AppProjectGanttRoute extends Route {
    @service store;
    @service router;
    @service trackedProject;

    /**
     * Load the model data for the Gantt chart
     * 
     * @method model
     * @return {Object} Model object containing project, issues, and milestones
     */
    async model() {
        try {
            // Load issues with relationships for Gantt chart
            const issues = await this.store.query('issue', {
                query: `((Issue.projectId : '${this.trackedProject.getProjectId()}'))`,
                rels: 'assignedTo,issuestatus,issuetype,issuemilestone,estimated,spent'
            });

            // Load milestones for the project
            const milestones = await this.store.query('milestone', {
                query: `(Milestone.projectId : '${this.trackedProject.getProjectId()}')`
            });

            return {
                project: this.trackedProject,
                issues: issues.filter(issue => issue.startDate), // Only issues with start dates
                milestones,
                allIssues: issues // Keep reference to all issues
            };
        } catch (error) {
            console.error('Error loading Gantt chart data:', error);
            
            // Fallback to basic project data
            return {
                project: this.trackedProject,
                issues: [],
                milestones: [],
                allIssues: [],
                error: 'Failed to load Gantt chart data'
            };
        }
    }

    /**
     * Setup controller with additional properties and actions
     * 
     * @method setupController
     * @param {Object} controller The route controller
     * @param {Object} model The resolved model
     */
    setupController(controller, model) {
        super.setupController(controller, model);
        
        // Set loading state
        controller.set('isLoading', false);
        
        // Set up Gantt chart specific properties
        controller.setProperties({
            selectedTask: null,
            timeScale: 'weeks',
            showDependencies: true,
            showMilestones: true,
            showCriticalPath: false
        });
    }

    /**
     * Handle loading state
     * 
     * @method loading
     * @param {Object} transition The route transition
     */
    loading(transition) {
        const controller = this.controllerFor('app.project.gantt');
        controller.set('isLoading', true);
        return true; // Allow the loading template to be shown
    }

    /**
     * Handle errors during route loading
     * 
     * @method error
     * @param {Error} error The error that occurred
     * @param {Object} transition The route transition
     */
    error(error, transition) {
        console.error('Gantt route error:', error);
        
        const controller = this.controllerFor('app.project.gantt');
        controller.setProperties({
            isLoading: false,
            error: 'Failed to load Gantt chart. Please try again.'
        });
        
        return true; // Allow the error to be handled by the error template
    }

    /**
     * Actions for the route
     */
    actions = {
        /**
         * Refresh the Gantt chart data
         */
        refreshGantt() {
            this.refresh();
        },

        /**
         * Handle task selection
         * 
         * @param {Object} task The selected task/issue
         */
        selectTask(task) {
            const controller = this.controllerFor('app.project.gantt');
            controller.set('selectedTask', task);
        },

        /**
         * Navigate to issue edit page
         * 
         * @param {Object} issue The issue to edit
         */
        editTask(issue) {
            this.router.transitionTo('app.project.issue.edit', issue.issueNumber);
        },

        /**
         * Navigate to create new issue
         */
        createTask() {
            this.router.transitionTo('app.project.issue.create');
        },

        /**
         * Handle task date changes from drag and drop
         * 
         * @param {Object} issue The issue being updated
         * @param {String} newStartDate New start date
         * @param {String} newEndDate New end date
         */
        async updateTaskDates(issue, newStartDate, newEndDate) {
            try {
                issue.setProperties({
                    startDate: newStartDate,
                    endDate: newEndDate
                });
                
                await issue.save();
                
                // Optionally show success message
                this.flashMessages?.success('Task dates updated successfully');
            } catch (error) {
                console.error('Error updating task dates:', error);
                
                // Revert changes
                issue.rollbackAttributes();
                
                // Show error message
                this.flashMessages?.error('Failed to update task dates');
            }
        },

        /**
         * Handle dependency updates
         * 
         * @param {Object} issue The issue to update
         * @param {Array} dependencyIds Array of dependency issue IDs
         */
        async updateTaskDependencies(issue, dependencyIds) {
            try {
                issue.set('dependencies', dependencyIds.join(','));
                await issue.save();
                
                this.flashMessages?.success('Task dependencies updated');
            } catch (error) {
                console.error('Error updating dependencies:', error);
                issue.rollbackAttributes();
                this.flashMessages?.error('Failed to update dependencies');
            }
        }
    }
}
