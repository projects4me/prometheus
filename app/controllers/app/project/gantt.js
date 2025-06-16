/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

/**
 * Gantt Chart Controller for Project
 * Handles Gantt chart interactions and state management
 *
 * @class AppProjectGanttController
 * @namespace Prometheus.Controllers
 * @extends Ember.Controller
 * @author Hammad Hassan <hammad@projects4.me>
 */
export default class AppProjectGanttController extends Controller {
    @service router;
    @service flashMessages;

    @tracked isLoading = false;
    @tracked selectedTask = null;
    @tracked timeScale = 'weeks';
    @tracked showDependencies = true;
    @tracked showMilestones = true;
    @tracked showCriticalPath = false;
    @tracked error = null;

    /**
     * Get filtered issues for Gantt chart display
     * 
     * @method get ganttIssues
     * @return {Array} Filtered issues with valid dates
     */
    get ganttIssues() {
        if (!this.model?.issues) {
            return [];
        }

        return this.model.issues.filter(issue => {
            // Only show issues with start dates
            return issue.startDate && issue.startDate.length > 0;
        }).sort((a, b) => {
            // Sort by start date
            const dateA = new Date(a.startDate);
            const dateB = new Date(b.startDate);
            return dateA - dateB;
        });
    }

    /**
     * Get project milestones for display
     * 
     * @method get projectMilestones
     * @return {Array} Project milestones
     */
    get projectMilestones() {
        if (!this.showMilestones || !this.model?.milestones) {
            return [];
        }

        return this.model.milestones.filter(milestone => {
            return milestone.startDate || milestone.endDate;
        });
    }

    /**
     * Check if there are any issues to display
     * 
     * @method get hasIssues
     * @return {Boolean} Whether there are issues to display
     */
    get hasIssues() {
        return this.ganttIssues.length > 0;
    }

    /**
     * Get project progress summary
     * 
     * @method get projectProgress
     * @return {Object} Progress summary
     */
    get projectProgress() {
        const issues = this.ganttIssues;
        
        if (issues.length === 0) {
            return {
                total: 0,
                completed: 0,
                inProgress: 0,
                notStarted: 0,
                overdue: 0,
                percentage: 0
            };
        }

        const summary = issues.reduce((acc, issue) => {
            acc.total++;
            
            const progress = issue.progressPercentage || 0;
            
            if (progress >= 100) {
                acc.completed++;
            } else if (progress > 0) {
                acc.inProgress++;
            } else {
                acc.notStarted++;
            }
            
            if (issue.isOverdue) {
                acc.overdue++;
            }
            
            return acc;
        }, {
            total: 0,
            completed: 0,
            inProgress: 0,
            notStarted: 0,
            overdue: 0
        });

        summary.percentage = Math.round((summary.completed / summary.total) * 100);
        
        return summary;
    }

    /**
     * Handle task selection
     * 
     * @method selectTask
     * @param {Object} task The selected task
     */
    @action
    selectTask(task) {
        this.selectedTask = task;
    }

    /**
     * Handle task editing
     * 
     * @method editTask
     * @param {Object} task The task to edit
     */
    @action
    editTask(task) {
        this.router.transitionTo('app.project.issue.edit', task.issueNumber);
    }

    /**
     * Handle task creation
     * 
     * @method createTask
     */
    @action
    createTask() {
        this.router.transitionTo('app.project.issue.create');
    }

    /**
     * Handle time scale change
     * 
     * @method changeTimeScale
     * @param {String} scale The new time scale
     */
    @action
    changeTimeScale(scale) {
        this.timeScale = scale;
    }

    /**
     * Toggle dependencies visibility
     * 
     * @method toggleDependencies
     */
    @action
    toggleDependencies() {
        this.showDependencies = !this.showDependencies;
    }

    /**
     * Toggle milestones visibility
     * 
     * @method toggleMilestones
     */
    @action
    toggleMilestones() {
        this.showMilestones = !this.showMilestones;
    }

    /**
     * Toggle critical path visibility
     * 
     * @method toggleCriticalPath
     */
    @action
    toggleCriticalPath() {
        this.showCriticalPath = !this.showCriticalPath;
    }

    /**
     * Handle task drag and drop
     * 
     * @method onTaskDrag
     * @param {String} taskId The ID of the task being dragged
     * @param {Number} deltaX The horizontal drag distance
     */
    @action
    onTaskDrag(taskId, deltaX) {
        // This would be implemented to provide visual feedback during drag
        // The actual date calculation and update would happen in onTaskDragEnd
    }

    /**
     * Handle task drag end
     * 
     * @method onTaskDragEnd
     * @param {Object} task The task that was dragged
     * @param {Number} deltaX The total horizontal drag distance
     */
    @action
    async onTaskDragEnd(task, deltaX) {
        try {
            // Calculate new dates based on drag distance
            // This is a simplified calculation - in a real implementation,
            // you'd convert deltaX to days based on the current time scale
            const daysToMove = Math.round(deltaX / 20); // Rough conversion
            
            if (daysToMove === 0) {
                return; // No significant movement
            }

            const currentStart = new Date(task.startDate);
            const currentEnd = task.endDate ? new Date(task.endDate) : null;
            
            const newStart = new Date(currentStart);
            newStart.setDate(newStart.getDate() + daysToMove);
            
            let newEnd = null;
            if (currentEnd) {
                newEnd = new Date(currentEnd);
                newEnd.setDate(newEnd.getDate() + daysToMove);
            }

            // Update the task
            task.setProperties({
                startDate: newStart.toISOString().split('T')[0],
                endDate: newEnd ? newEnd.toISOString().split('T')[0] : null
            });

            await task.save();
            
            this.flashMessages.success('Task dates updated successfully');
        } catch (error) {
            console.error('Error updating task dates:', error);
            task.rollbackAttributes();
            this.flashMessages.error('Failed to update task dates');
        }
    }

    /**
     * Handle task resize
     * 
     * @method onTaskResize
     * @param {Object} task The task being resized
     * @param {Number} deltaX The resize distance
     * @param {Number} newWidth The new width
     */
    @action
    async onTaskResize(task, deltaX, newWidth) {
        try {
            // Calculate new end date based on resize
            const daysToAdd = Math.round(deltaX / 20); // Rough conversion
            
            if (daysToAdd === 0) {
                return;
            }

            const currentEnd = task.endDate ? new Date(task.endDate) : new Date(task.startDate);
            const newEnd = new Date(currentEnd);
            newEnd.setDate(newEnd.getDate() + daysToAdd);

            task.set('endDate', newEnd.toISOString().split('T')[0]);
            await task.save();
            
            this.flashMessages.success('Task duration updated successfully');
        } catch (error) {
            console.error('Error updating task duration:', error);
            task.rollbackAttributes();
            this.flashMessages.error('Failed to update task duration');
        }
    }

    /**
     * Handle date selection from timeline
     * 
     * @method onDateSelect
     * @param {Date} date The selected date
     */
    @action
    onDateSelect(date) {
        // Could be used to create new tasks or navigate to specific dates
        console.log('Date selected:', date);
    }

    /**
     * Handle date hover for preview
     * 
     * @method onDateHover
     * @param {Date} date The hovered date
     */
    @action
    onDateHover(date) {
        // Could be used to show date information or preview
    }

    /**
     * Refresh the Gantt chart data
     * 
     * @method refreshChart
     */
    @action
    refreshChart() {
        this.send('refreshGantt');
    }

    /**
     * Export Gantt chart data
     * 
     * @method exportChart
     * @param {String} format The export format (pdf, png, etc.)
     */
    @action
    exportChart(format = 'png') {
        // This would implement chart export functionality
        // For now, just show a message
        this.flashMessages.info(`Export to ${format.toUpperCase()} functionality coming soon`);
    }

    /**
     * Print the Gantt chart
     * 
     * @method printChart
     */
    @action
    printChart() {
        window.print();
    }
}
