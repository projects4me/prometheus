import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class GanttChartGanttChartComponent extends Component {
    @service intl;

    @tracked timeScale = 'weeks'; // 'days', 'weeks', 'months'
    @tracked selectedTask = null;
    @tracked isDragging = false;
    @tracked dragStartX = 0;
    @tracked dragTaskId = null;

    /**
     * Calculate the timeline start date based on project issues
     * 
     * @method get timelineStartDate
     * @return {Date} The earliest start date from all issues
     */
    get timelineStartDate() {
        if (!this.args.issues || this.args.issues.length === 0) {
            return new Date();
        }

        const dates = this.args.issues
            .map(issue => new Date(issue.startDate))
            .filter(date => !isNaN(date.getTime()));

        if (dates.length === 0) {
            return new Date();
        }

        const minDate = new Date(Math.min(...dates));
        // Start timeline from beginning of the week/month for better visualization
        if (this.timeScale === 'weeks') {
            minDate.setDate(minDate.getDate() - minDate.getDay());
        } else if (this.timeScale === 'months') {
            minDate.setDate(1);
        }
        return minDate;
    }

    /**
     * Calculate the timeline end date based on project issues
     * 
     * @method get timelineEndDate
     * @return {Date} The latest end date from all issues
     */
    get timelineEndDate() {
        if (!this.args.issues || this.args.issues.length === 0) {
            const endDate = new Date();
            endDate.setMonth(endDate.getMonth() + 3); // Default 3 months ahead
            return endDate;
        }

        const dates = this.args.issues
            .map(issue => new Date(issue.endDate || issue.startDate))
            .filter(date => !isNaN(date.getTime()));

        if (dates.length === 0) {
            const endDate = new Date();
            endDate.setMonth(endDate.getMonth() + 3);
            return endDate;
        }

        const maxDate = new Date(Math.max(...dates));
        // Add buffer time for better visualization
        if (this.timeScale === 'days') {
            maxDate.setDate(maxDate.getDate() + 7);
        } else if (this.timeScale === 'weeks') {
            maxDate.setDate(maxDate.getDate() + 14);
        } else {
            maxDate.setMonth(maxDate.getMonth() + 1);
        }
        return maxDate;
    }

    /**
     * Generate timeline columns based on the time scale
     * 
     * @method get timelineColumns
     * @return {Array} Array of timeline column objects
     */
    get timelineColumns() {
        const columns = [];
        const startDate = new Date(this.timelineStartDate);
        const endDate = new Date(this.timelineEndDate);
        const current = new Date(startDate);

        while (current <= endDate) {
            const columnDate = new Date(current);
            let label = '';
            let width = 100; // Default width in pixels

            if (this.timeScale === 'days') {
                label = this.formatDate(columnDate, 'MMM DD');
                current.setDate(current.getDate() + 1);
                width = 80;
            } else if (this.timeScale === 'weeks') {
                label = `Week ${this.getWeekNumber(columnDate)}`;
                current.setDate(current.getDate() + 7);
                width = 120;
            } else if (this.timeScale === 'months') {
                label = this.formatDate(columnDate, 'MMM YYYY');
                current.setMonth(current.getMonth() + 1);
                width = 150;
            }

            columns.push({
                date: columnDate,
                label,
                width
            });
        }

        return columns;
    }

    /**
     * Calculate task bar positions and dimensions
     * 
     * @method get taskBars
     * @return {Array} Array of task bar objects with positioning data
     */
    get taskBars() {
        if (!this.args.issues) {
            return [];
        }

        return this.args.issues.map(issue => {
            const startDate = new Date(issue.startDate);
            const endDate = new Date(issue.endDate || issue.startDate);
            
            // Calculate position from timeline start
            const timelineStart = this.timelineStartDate.getTime();
            const taskStart = startDate.getTime();
            const taskEnd = endDate.getTime();
            
            const totalTimelineWidth = this.timelineColumns.reduce((sum, col) => sum + col.width, 0);
            const timelineSpan = this.timelineEndDate.getTime() - timelineStart;
            
            const leftOffset = ((taskStart - timelineStart) / timelineSpan) * totalTimelineWidth;
            const width = Math.max(((taskEnd - taskStart) / timelineSpan) * totalTimelineWidth, 20); // Minimum 20px width
            
            return {
                issue,
                leftOffset: Math.max(0, leftOffset),
                width,
                progress: this.calculateTaskProgress(issue),
                color: this.getTaskColor(issue),
                isDraggable: this.canEditTask(issue)
            };
        });
    }

    /**
     * Calculate task progress percentage
     * 
     * @method calculateTaskProgress
     * @param {Object} issue The issue object
     * @return {Number} Progress percentage (0-100)
     */
    @action
    calculateTaskProgress(issue) {
        if (issue.issuestatus && issue.issuestatus.get) {
            const status = issue.issuestatus.get('name');
            if (status === 'done' || status === 'closed') {
                return 100;
            } else if (status === 'in-progress' || status === 'testing') {
                return 50;
            }
        }
        return 0;
    }

    /**
     * Get task color based on priority and status
     * 
     * @method getTaskColor
     * @param {Object} issue The issue object
     * @return {String} CSS color value
     */
    @action
    getTaskColor(issue) {
        const priority = issue.priority || 'medium';
        const colorMap = {
            'high': '#e74c3c',
            'medium': '#3498db',
            'low': '#2ecc71'
        };
        return colorMap[priority] || colorMap['medium'];
    }

    /**
     * Check if user can edit the task
     * 
     * @method canEditTask
     * @param {Object} issue The issue object
     * @return {Boolean} Whether task can be edited
     */
    @action
    canEditTask(issue) {
        // This would integrate with the existing permission system
        return true; // Simplified for now
    }

    /**
     * Format date according to the given pattern
     * 
     * @method formatDate
     * @param {Date} date The date to format
     * @param {String} pattern The format pattern
     * @return {String} Formatted date string
     */
    @action
    formatDate(date, pattern) {
        const options = {};
        if (pattern === 'MMM DD') {
            options.month = 'short';
            options.day = '2-digit';
        } else if (pattern === 'MMM YYYY') {
            options.month = 'short';
            options.year = 'numeric';
        }
        return date.toLocaleDateString('en-US', options);
    }

    /**
     * Get week number for a given date
     * 
     * @method getWeekNumber
     * @param {Date} date The date
     * @return {Number} Week number
     */
    @action
    getWeekNumber(date) {
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
        const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
        return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
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
     * Handle task selection
     * 
     * @method selectTask
     * @param {Object} issue The selected issue
     */
    @action
    selectTask(issue) {
        this.selectedTask = issue;
        if (this.args.onTaskSelect) {
            this.args.onTaskSelect(issue);
        }
    }

    /**
     * Handle task drag start
     * 
     * @method startDrag
     * @param {Object} issue The issue being dragged
     * @param {Event} event The mouse event
     */
    @action
    startDrag(issue, event) {
        if (!this.canEditTask(issue)) {
            return;
        }

        this.isDragging = true;
        this.dragTaskId = issue.id;
        this.dragStartX = event.clientX;
        
        document.addEventListener('mousemove', this.handleDrag);
        document.addEventListener('mouseup', this.endDrag);
    }

    /**
     * Handle task dragging
     * 
     * @method handleDrag
     * @param {Event} event The mouse event
     */
    @action
    handleDrag(event) {
        if (!this.isDragging) {
            return;
        }

        const deltaX = event.clientX - this.dragStartX;
        
        if (this.args.onTaskDrag) {
            this.args.onTaskDrag(this.dragTaskId, deltaX);
        }
    }

    /**
     * Handle drag end
     * 
     * @method endDrag
     */
    @action
    endDrag() {
        this.isDragging = false;
        this.dragTaskId = null;
        this.dragStartX = 0;
        
        document.removeEventListener('mousemove', this.handleDrag);
        document.removeEventListener('mouseup', this.endDrag);
        
        if (this.args.onTaskDragEnd) {
            this.args.onTaskDragEnd();
        }
    }
}
