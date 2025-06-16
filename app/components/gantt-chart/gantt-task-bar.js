/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

/**
 * Gantt Task Bar Component
 * Displays individual task bars with progress and interactions
 *
 * @class GanttTaskBarComponent
 * @namespace Prometheus.Components.GanttChart
 * @extends Glimmer.Component
 * @author Hammad Hassan <hammad@projects4.me>
 */
export default class GanttTaskBarComponent extends Component {

    @tracked isHovered = false;
    @tracked isDragging = false;
    @tracked isResizing = false;
    @tracked dragStartX = 0;
    @tracked resizeStartX = 0;
    @tracked originalWidth = 0;
    @tracked originalLeft = 0;

    /**
     * Get the task bar style object
     *
     * @method get taskBarStyle
     * @return {Object} Style object for the task bar
     */
    get taskBarStyle() {
        const taskBar = this.args.taskBar;
        
        return {
            left: `${taskBar.leftOffset}px`,
            width: `${taskBar.width}px`,
            backgroundColor: taskBar.color,
            opacity: this.isDragging ? 0.7 : 1,
            transform: this.isDragging ? 'scale(1.02)' : 'scale(1)',
            zIndex: this.isDragging || this.isHovered ? 10 : 1
        };
    }

    /**
     * Get the progress bar style object
     *
     * @method get progressBarStyle
     * @return {Object} Style object for the progress bar
     */
    get progressBarStyle() {
        const progress = this.args.taskBar.progress || 0;
        
        return {
            width: `${progress}%`,
            backgroundColor: this.getProgressColor(progress)
        };
    }

    /**
     * Get progress color based on percentage
     *
     * @method getProgressColor
     * @param {Number} progress Progress percentage
     * @return {String} CSS color value
     */
    getProgressColor(progress) {
        if (progress >= 100) {
            return '#27ae60'; // Green for completed
        } else if (progress >= 50) {
            return '#f39c12'; // Orange for in progress
        } else {
            return '#e74c3c'; // Red for not started/low progress
        }
    }

    /**
     * Get CSS classes for the task bar
     *
     * @method get taskBarClasses
     * @return {String} CSS classes
     */
    get taskBarClasses() {
        const classes = ['gantt-task-bar'];
        const issue = this.args.taskBar.issue;
        
        // Add priority class
        if (issue.priority) {
            classes.push(`gantt-task-bar--${issue.priority}`);
        }
        
        // Add status class
        if (issue.issuestatus && issue.issuestatus.get) {
            const status = issue.issuestatus.get('name');
            classes.push(`gantt-task-bar--${status}`);
        }
        
        // Add interaction states
        if (this.isHovered) {
            classes.push('gantt-task-bar--hovered');
        }
        
        if (this.isDragging) {
            classes.push('gantt-task-bar--dragging');
        }
        
        if (this.isResizing) {
            classes.push('gantt-task-bar--resizing');
        }
        
        // Add overdue class
        if (issue.isOverdue) {
            classes.push('gantt-task-bar--overdue');
        }
        
        return classes.join(' ');
    }

    /**
     * Get tooltip text for the task bar
     *
     * @method get tooltipText
     * @return {String} Tooltip text
     */
    get tooltipText() {
        const issue = this.args.taskBar.issue;
        const progress = this.args.taskBar.progress || 0;
        
        let tooltip = `${issue.subject}\n`;
        tooltip += `Start: ${issue.startDate}\n`;
        tooltip += `End: ${issue.endDate || 'Not set'}\n`;
        tooltip += `Progress: ${progress}%\n`;
        tooltip += `Priority: ${issue.priority || 'Medium'}\n`;
        
        if (issue.assignedTo && issue.assignedTo.get) {
            tooltip += `Assigned to: ${issue.assignedTo.get('name')}`;
        }
        
        return tooltip;
    }

    /**
     * Handle task bar click
     *
     * @method onClick
     * @param {Event} event Click event
     */
    @action
    onClick(event) {
        event.stopPropagation();
        
        if (this.args.onTaskClick) {
            this.args.onTaskClick(this.args.taskBar.issue);
        }
    }

    /**
     * Handle task bar double click for editing
     *
     * @method onDoubleClick
     * @param {Event} event Double click event
     */
    @action
    onDoubleClick(event) {
        event.stopPropagation();
        
        if (this.args.onTaskEdit) {
            this.args.onTaskEdit(this.args.taskBar.issue);
        }
    }

    /**
     * Handle mouse enter for hover state
     *
     * @method onMouseEnter
     */
    @action
    onMouseEnter() {
        this.isHovered = true;
        
        if (this.args.onTaskHover) {
            this.args.onTaskHover(this.args.taskBar.issue, true);
        }
    }

    /**
     * Handle mouse leave for hover state
     *
     * @method onMouseLeave
     */
    @action
    onMouseLeave() {
        this.isHovered = false;
        
        if (this.args.onTaskHover) {
            this.args.onTaskHover(this.args.taskBar.issue, false);
        }
    }

    /**
     * Handle drag start
     *
     * @method onDragStart
     * @param {Event} event Mouse down event
     */
    @action
    onDragStart(event) {
        if (!this.args.taskBar.isDraggable) {
            return;
        }
        
        event.preventDefault();
        event.stopPropagation();
        
        this.isDragging = true;
        this.dragStartX = event.clientX;
        this.originalLeft = this.args.taskBar.leftOffset;
        
        document.addEventListener('mousemove', this.onDrag);
        document.addEventListener('mouseup', this.onDragEnd);
        
        if (this.args.onDragStart) {
            this.args.onDragStart(this.args.taskBar.issue);
        }
    }

    /**
     * Handle dragging
     *
     * @method onDrag
     * @param {Event} event Mouse move event
     */
    @action
    onDrag = (event) => {
        if (!this.isDragging) {
            return;
        }
        
        const deltaX = event.clientX - this.dragStartX;
        const newLeft = this.originalLeft + deltaX;
        
        if (this.args.onDrag) {
            this.args.onDrag(this.args.taskBar.issue, deltaX, newLeft);
        }
    }

    /**
     * Handle drag end
     *
     * @method onDragEnd
     */
    @action
    onDragEnd = () => {
        this.isDragging = false;
        
        document.removeEventListener('mousemove', this.onDrag);
        document.removeEventListener('mouseup', this.onDragEnd);
        
        if (this.args.onDragEnd) {
            this.args.onDragEnd(this.args.taskBar.issue);
        }
    }

    /**
     * Handle resize start (from right edge)
     *
     * @method onResizeStart
     * @param {Event} event Mouse down event
     */
    @action
    onResizeStart(event) {
        if (!this.args.taskBar.isDraggable) {
            return;
        }
        
        event.preventDefault();
        event.stopPropagation();
        
        this.isResizing = true;
        this.resizeStartX = event.clientX;
        this.originalWidth = this.args.taskBar.width;
        
        document.addEventListener('mousemove', this.onResize);
        document.addEventListener('mouseup', this.onResizeEnd);
        
        if (this.args.onResizeStart) {
            this.args.onResizeStart(this.args.taskBar.issue);
        }
    }

    /**
     * Handle resizing
     *
     * @method onResize
     * @param {Event} event Mouse move event
     */
    @action
    onResize = (event) => {
        if (!this.isResizing) {
            return;
        }
        
        const deltaX = event.clientX - this.resizeStartX;
        const newWidth = Math.max(20, this.originalWidth + deltaX); // Minimum 20px width
        
        if (this.args.onResize) {
            this.args.onResize(this.args.taskBar.issue, deltaX, newWidth);
        }
    }

    /**
     * Handle resize end
     *
     * @method onResizeEnd
     */
    @action
    onResizeEnd = () => {
        this.isResizing = false;
        
        document.removeEventListener('mousemove', this.onResize);
        document.removeEventListener('mouseup', this.onResizeEnd);
        
        if (this.args.onResizeEnd) {
            this.args.onResizeEnd(this.args.taskBar.issue);
        }
    }

    /**
     * Cleanup event listeners when component is destroyed
     */
    willDestroy() {
        super.willDestroy(...arguments);
        
        document.removeEventListener('mousemove', this.onDrag);
        document.removeEventListener('mouseup', this.onDragEnd);
        document.removeEventListener('mousemove', this.onResize);
        document.removeEventListener('mouseup', this.onResizeEnd);
    }
}
