/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { calculateBarWidth, calculateBarPosition } from 'prometheus/utils/gantt-helpers';
import DateUtils from 'prometheus/utils/date';
import { later } from '@ember/runloop';

/**
 * This component renders a single Gantt bar (milestone or task)
 *
 * @class GanttBar
 * @namespace Prometheus.Components.AppUi.GanttChart
 * @extends Component
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class GanttBarComponent extends Component {
	/**
	 * The internationalization service for handling translations
	 *
	 * @property intl
	 * @type {Prometheus.Services.intl}
	 * @public
	 */
	@service intl;

    /**
     * Track if the bar is being dragged
     *
     * @property isDragging
     * @type Boolean
     * @for GanttBar
     * @private
     */
    @tracked isDragging = false;

    /**
     * Track hover state to toggle dependency connectors
     *
     * @property isHovering
     * @type Boolean
     * @for GanttBar
     * @private
     */
    @tracked isHovering = false;

    /**
     * Track if the bar is being resized
     *
     * @property isResizing
     * @type Boolean
     * @for GanttBar
     * @private
     */
    @tracked isResizing = false;

    /**
     * Track which resize handle is active ('left' or 'right')
     *
     * @property resizeHandle
     * @type String
     * @for GanttBar
     * @private
     */
    resizeHandle = null;

    /**
     * Store the starting X position of the resize
     *
     * @property resizeStartX
     * @type Number
     * @for GanttBar
     * @private
     */
    resizeStartX = 0;

    /**
     * Store the original start date before resize
     *
     * @property originalStartDate
     * @type String
     * @for GanttBar
     * @private
     */
    originalStartDate = null;

    /**
     * Store the original end date before resize
     *
     * @property originalEndDate
     * @type String
     * @for GanttBar
     * @private
     */
    originalEndDate = null;

    /**
     * Store the original width before resize
     *
     * @property originalWidth
     * @type Number
     * @for GanttBar
     * @private
     */
    originalWidth = 0;

    /**
     * Store the original left position before resize
     *
     * @property originalLeft
     * @type Number
     * @for GanttBar
     * @private
     */
    originalLeftForResize = 0;

    /**
     * Store the current resize offset
     *
     * @property resizeOffset
     * @type Number
     * @for GanttBar
     * @private
     */
    @tracked resizeOffset = 0;

    /**
     * Store the starting X position of the drag (viewport coordinates)
     *
     * @property dragStartX
     * @type Number
     * @for GanttBar
     * @private
     */
    dragStartX = 0;

    /**
     * Last known mouse X position (for scroll compensation)
     *
     * @property lastMouseX
     * @type Number
     * @for GanttBar
     * @private
     */
    lastMouseX = 0;

    /**
     * Accumulated scroll delta during drag (to account for auto-scroll)
     *
     * @property accumulatedScrollDeltaX
     * @type Number
     * @for GanttBar
     * @private
     */
    accumulatedScrollDeltaX = 0;

    /**
     * Store the original left position before drag
     *
     * @property originalLeft
     * @type Number
     * @for GanttBar
     * @private
     */
    originalLeft = 0;

    /**
     * Store the current drag offset
     *
     * @property dragOffset
     * @type Number
     * @for GanttBar
     * @private
     */
    @tracked dragOffset = 0;


    /**
     * Animation frame ID for auto-scroll
     *
     * @property autoScrollFrameId
     * @type Number|null
     * @for GanttBar
     * @private
     */
    autoScrollFrameId = null;

    /**
     * Scroll zone threshold in pixels (distance from edge to trigger scroll)
     *
     * @property scrollZone
     * @type Number
     * @for GanttBar
     * @private
     */
    scrollZone = 20;

    /**
     * Scroll speed in pixels per frame (constant speed)
     *
     * @property scrollSpeed
     * @type Number
     * @for GanttBar
     * @private
     */
    scrollSpeed = 15;

    /**
     * Current horizontal scroll speed
     *
     * @property currentScrollX
     * @type Number
     * @for GanttBar
     * @private
     */
    currentScrollX = 0;

    /**
     * Calculate the width of the bar
     *
     * @property barWidth
     * @type Number
     * @for GanttBar
     * @public
     */
    get barWidth() {
        return calculateBarWidth(
            this.args.startDate,
            this.args.endDate,
            this.args.dayWidth
        );
    }

    /**
     * Calculate the left position of the bar
     *
     * @property barLeft
     * @type Number
     * @for GanttBar
     * @public
     */
    get barLeft() {
        return calculateBarPosition(
            this.args.timelineStart,
            this.args.startDate,
            this.args.dayWidth
        );
    }

    /**
     * Get the bar style string
     *
     * @property barStyle
     * @type String
     * @for GanttBar
     * @public
     */
    get barStyle() {
        return `left: ${this.barLeft}px; width: ${this.barWidth}px;`;
    }

    /**
     * Get the bar class based on type
     *
     * @property barClass
     * @type String
     * @for GanttBar
     * @public
     */
    get barClass() {
        let classes = ['gantt-bar'];
        
        if (this.args.type === 'milestone') {
            classes.push('gantt-bar-milestone');
        } else {
            classes.push('gantt-bar-task');
            
            // Add status class
            if (this.args.status) {
                classes.push(`bar-status-${this.args.status}`);
            }
            
            // Add priority class
            if (this.args.priority) {
                classes.push(`bar-priority-${this.args.priority}`);
            }
        }
        
        return classes.join(' ');
    }

    /**
     * Get the display label for the bar
     *
     * @property displayLabel
     * @type String
     * @for GanttBar
     * @public
     */
    get displayLabel() {
        return this.args.label || '';
    }

    /**
     * Check if label should be shown inside bar
     *
     * @property showLabel
     * @type Boolean
     * @for GanttBar
     * @public
     */
    get showLabel() {
        // Only show label if bar is wide enough (> 100px)
        return this.displayLabel;
    }

    /**
     * Check if the issue is completed (status is 'done')
     *
     * @property isCompleted
     * @type Boolean
     * @for GanttBar
     * @public
     */
    get isCompleted() {
        return this.args.status === 'done';
    }

    /**
     * Determine whether dependency connectors should be visible
     *
     * @property shouldShowConnectors
     * @type Boolean
     * @for GanttBar
     * @public
     */
    get shouldShowConnectors() {
        if (!this.args.showConnectors) {
            return false;
        }

        if (this.args.isLinking) {
            return true;
        }

        if (this.args.linkingState?.sourceIssue?.id === this.args.issue?.id) {
            return true;
        }

        return this.isHovering;
    }

    /**
     * Action to handle bar click
     *
     * @method handleClick
     * @public
     */
    @action
    handleClick(event) {
        // Only trigger click if not dragging and it's not a task bar
        if (!this.isDragging && this.args.type !== 'task' && this.args.onClick) {
            event.stopPropagation();
            this.args.onClick();
        }
    }

    /**
     * Check if mouse is in a resize zone (left or right edge)
     *
     * @method isInResizeZone
     * @param {Event} event The mouse event
     * @param {HTMLElement} element The bar element
     * @returns {String|null} 'left', 'right', or null
     * @private
     */
    isInResizeZone(event, element) {
        if (!element || this.args.type !== 'task') {
            return null;
        }

        const rect = element.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const resizeZoneWidth = 15; // Width of resize zone in pixels

        if (x >= 0 && x <= resizeZoneWidth) {
            return 'left';
        }

        if (x >= rect.width - resizeZoneWidth && x <= rect.width) {
            return 'right';
        }

        return null;
    }

    /**
     * Action to handle mouse down on bar (start drag or resize)
     *
     * @method handleMouseDown
     * @param {Event} event The mouse event
     * @public
     */
    @action
    handleMouseDown(event) {
        // Only allow dragging on left mouse button (button 0)
        if (event.button !== 0) {
            return;
        }

        if (this.args.type !== 'task') {
            return;
        }

        if (event.target.closest('.connector-dot')) {
            return;
        }

        const resizeZone = this.isInResizeZone(event, event.currentTarget);
        if (resizeZone) {
            this.handleResizeMouseDown(resizeZone, event);
            return;
        }

        event.preventDefault();
        event.stopPropagation();
        
        this.isDragging = false;
        this.dragStartX = event.clientX;
        this.originalLeft = this.barLeft;
        this.dragOffset = 0;

        // Add event listeners to document for mouse move and up
        document.addEventListener('mousemove', this.handleMouseMove);
        document.addEventListener('mouseup', this.handleMouseUp);
    }

    /**
     * Action to handle mouse move on bar (detect resize zones for cursor)
     *
     * @method handleBarMouseMove
     * @param {Event} event The mouse event
     * @public
     */
    @action
    handleBarMouseMove(event) {
        if (this.args.type !== 'task') {
            return;
        }

        if (this.isDragging || this.isResizing) {
            return;
        }

        if (event.target.closest('.connector-dot')) {
            return;
        }

        const resizeZone = this.isInResizeZone(event, event.currentTarget);
        if (resizeZone === 'left') {
            event.currentTarget.style.cursor = 'w-resize';
        } else if (resizeZone === 'right') {
            event.currentTarget.style.cursor = 'e-resize';
        } else {
            event.currentTarget.style.cursor = '';
        }
    }

    /**
     * Action to handle mouse move during drag
     *
     * @method handleMouseMove
     * @param {Event} event The mouse event
     * @public
     */
    @action
    handleMouseMove(event) {
        event.preventDefault();
        
        const deltaX = event.clientX - this.dragStartX;
        
        // If moved more than 3px, consider it a drag
        if (Math.abs(deltaX) > 3) {
            if (!this.isDragging) {
                this.isDragging = true;
                // Notify drag start
                if (this.args.onDragStart) {
                    this.args.onDragStart();
                }
            }
        }
        
        if (this.isDragging) {
            this.lastMouseX = event.clientX;
            
            this.dragOffset = deltaX + this.accumulatedScrollDeltaX;
            
            if (this.args.onDragUpdate) {
                this.args.onDragUpdate(this.dragOffset);
            }
            if (this.args.onCheckAutoScroll) {
                const barLeft = this.effectiveBarLeft + this.dragOffset;
                const barWidth = this.effectiveBarWidth;
                this.args.onCheckAutoScroll(barLeft, barWidth, (scrollDeltaX) => {
                    this.syncBarWithScroll(scrollDeltaX);
                });
            }
        }
    }

    /**
     * Action to handle mouse up (end drag)
     *
     * @method handleMouseUp
     * @param {Event} event The mouse event
     * @public
     */
    @action
   async handleMouseUp(event) {
        if (event.button !== 0 && event.button !== undefined) {
            return;
        }
        event.preventDefault();
        document.removeEventListener('mousemove', this.handleMouseMove);
        document.removeEventListener('mouseup', this.handleMouseUp);
        if (this.args.onStopAutoScroll) {
            this.args.onStopAutoScroll();
        }
        if (this.isDragging && this.args.onDragEnd) {
            const daysMoved = Math.round(this.dragOffset / this.args.dayWidth);
            
            if (daysMoved !== 0) {
                this.resetDragState();
                try {
                    await this.args.onDragEnd(daysMoved);
                }
                finally{ 
                    this.args.updateDependencyPositions();
                }
            } else {
                this.resetDragState();
            }
        } else {
            this.resetDragState();
        }
    }

    /**
     * Reset the drag state
     *
     * @method resetDragState
     * @public
     */
    @action resetDragState() {
        this.isDragging = false;
        this.dragOffset = 0;
        this.dragStartX = 0;
        this.originalLeft = 0;
        this.lastMouseX = 0;
        this.accumulatedScrollDeltaX = 0;
        if (this.args.onStopAutoScroll) {
            this.args.onStopAutoScroll();
        }
        later(() => {
            this.args.updateDependencyPositions();
        }, 200);
    }

    /**
     * Capture the bar element for dependency calculations
     *
     * @method registerElement
     * @param {HTMLElement} element
     * @public
     */
    @action registerElement(element) {
        if (this.args.registerBar && this.args.issue?.id) {
            this.args.registerBar(this.args.issue.id, element);
        }
    }

    /**
     * Cleanup when the bar element is destroyed
     *
     * @method unregisterElement
     * @public
     */
    @action unregisterElement() {
        if (this.args.unregisterBar && this.args.issue?.id) {
            this.args.unregisterBar(this.args.issue.id);
        }
    }

    /**
     * Handle hover to show connectors and hover zones
     *
     * @method handleMouseEnter
     * @public
     */
    @action handleMouseEnter() {
        // Show connectors when hovering over the bar to indicate they're available
        this.isHovering = true;
    }

    /**
     * Handle hover on hover zone to keep connectors visible
     *
     * @method handleHoverZoneEnter
     * @public
     */
    @action handleHoverZoneEnter() {
        this.isHovering = true;
    }

    /**
     * Handle mouse leave to hide connectors and reset cursor
     *
     * @method handleMouseLeave
     * @param {Event} event The mouse event
     * @public
     */
    @action handleMouseLeave(event) {
        this.isHovering = false;
        if (event.currentTarget && !this.isDragging && !this.isResizing) {
            event.currentTarget.style.cursor = '';
        }
    }

    /**
     * Handle clicking on a connector dot
     * If linking state exists, complete the connection
     * Otherwise, start a new connection
     *
     * @method handleConnectorClick
     * @param {String} position
     * @param {Event} event
     * @public
     */
    @action handleConnectorClick(position, event) {
        if (event.button !== 0 && event.button !== undefined) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();

        if (!this.args.issue) {
            return;
        }

        // If there's an active linking state, try to complete the connection
        if (this.args.linkingState && this.args.linkingState.sourceIssue) {
            if (this.args.onCompleteDependencyLink) {
                this.args.onCompleteDependencyLink(this.args.issue, position, event);
            }
        } else {
            // Start a new connection
            if (this.args.onStartDependencyLink) {
                this.args.onStartDependencyLink(this.args.issue, position, event);
            }
        }
    }

    /**
     * Apply effective bar style including drag offset directly to element
     *
     * @method applyBarStyle
     * @param {HTMLElement} element
     * @TODO Come up with more optimal solution for dependency positions update instead of using requestAnimationFrame.
     * @public
     */
    @action
    applyBarStyle(element) {
        if (!element) {
            return;
        }
        const left = this.effectiveBarLeft + this.dragOffset;
        const width = this.effectiveBarWidth;
        element.style.left = `${left}px`;
        element.style.width = `${width}px`;
        if (this.isDragging || this.isResizing) {
            element.style.opacity = '0.7';
            element.style.cursor = this.isResizing ? (this.resizeHandle === 'left' ? 'w-resize' : 'e-resize') : 'grabbing';
        } else {
            element.style.opacity = '';
            element.style.cursor = '';
        }
    }

    /**
     * Get the effective bar class including dragging and resizing state
     *
     * @property effectiveBarClass
     * @type String
     * @for GanttBar
     * @public
     */
    get effectiveBarClass() {
        let classes = [this.barClass];
        
        if (this.args.type === 'task') {
            classes.push('draggable');
        }
        
        if (this.isDragging) {
            classes.push('dragging');
        }

        if (this.isResizing) {
            classes.push('resizing');
        }
        
        return classes.join(' ');
    }

    /**
     * Action to handle resize handle mouse down (start resize)
     *
     * @method handleResizeMouseDown
     * @param {String} handle 'left' or 'right'
     * @param {Event} event The mouse event
     * @public
     */
    @action
    handleResizeMouseDown(handle, event) {
        // Only allow resizing on left mouse button (button 0)
        if (event.button !== 0) {
            return;
        }

        // Only allow resizing for task bars
        if (this.args.type !== 'task') {
            return;
        }

        event.preventDefault();
        event.stopPropagation();

        this.isResizing = true;
        this.resizeHandle = handle;
        this.resizeStartX = event.clientX;
        this.originalStartDate = this.args.startDate;
        this.originalEndDate = this.args.endDate;
        this.originalWidth = this.barWidth;
        this.originalLeftForResize = this.barLeft;
        this.resizeOffset = 0;
        this.lastMouseX = event.clientX;
        this.accumulatedScrollDeltaX = 0;

        if (this.args.onResizeStart) {
            this.args.onResizeStart();
        }

        document.addEventListener('mousemove', this.handleResizeMouseMove);
        document.addEventListener('mouseup', this.handleResizeMouseUp);
    }

    /**
     * Action to handle mouse move during resize
     *
     * @method handleResizeMouseMove
     * @param {Event} event The mouse event
     * @public
     */
    @action
    handleResizeMouseMove(event) {
        if (!this.isResizing) {
            return;
        }

        event.preventDefault();

        this.lastMouseX = event.clientX;

        const deltaX = event.clientX - this.resizeStartX;
        
        this.resizeOffset = deltaX + this.accumulatedScrollDeltaX;

        if (this.args.onResizeUpdate) {
            this.args.onResizeUpdate(this.resizeHandle, this.resizeOffset);
        }
        if (this.args.onCheckAutoScroll) {
            const barLeft = this.effectiveBarLeft;
            const barWidth = this.effectiveBarWidth;
            this.args.onCheckAutoScroll(barLeft, barWidth, (scrollDeltaX) => {
                this.syncBarWithScroll(scrollDeltaX);
            });
        }
    }

    /**
     * Action to handle mouse up (end resize)
     *
     * @method handleResizeMouseUp
     * @param {Event} event The mouse event
     * @public
     */
    @action
    async handleResizeMouseUp(event) {
        if (event.button !== 0 && event.button !== undefined) {
            return;
        }

        event.preventDefault();
        document.removeEventListener('mousemove', this.handleResizeMouseMove);
        document.removeEventListener('mouseup', this.handleResizeMouseUp);
        if (this.args.onStopAutoScroll) {
            this.args.onStopAutoScroll();
        }

        if (this.isResizing && this.args.onResizeEnd) {
            const daysOffset = Math.round(this.resizeOffset / this.args.dayWidth);
            
            if (daysOffset !== 0) {
                let newStartDate = this.originalStartDate;
                let newEndDate = this.originalEndDate;

                if (this.resizeHandle === 'left') {
                    // Resizing from left: adjust start date
                    newStartDate = moment(this.originalStartDate)
                        .add(daysOffset, 'days')
                        .format('YYYY-MM-DD');
                    
                    // Ensure start date doesn't exceed end date
                    if (moment(newStartDate).isAfter(this.originalEndDate)) {
                        newStartDate = this.originalEndDate;
                    }
                } else if (this.resizeHandle === 'right') {
                    // Resizing from right: calculate end date from the right edge position
                    // The bar width is inclusive, so we need to account for that
                    // Calculate the new width in days (inclusive)
                    const newWidth = this.originalWidth + this.resizeOffset;
                    const newWidthInDays = Math.max(1, Math.round(newWidth / this.args.dayWidth));
                    
                    // End date = start date + (width in days - 1) because width is inclusive
                    // For example: start Oct 15, width 5 days = Oct 15, 16, 17, 18, 19 (end = Oct 19)
                    newEndDate = moment(this.originalStartDate)
                        .add(newWidthInDays - 1, 'days')
                        .format('YYYY-MM-DD');
                    
                    // Ensure end date doesn't go before start date
                    if (moment(newEndDate).isBefore(this.originalStartDate)) {
                        newEndDate = this.originalStartDate;
                    }
                }

                this.resetResizeState();
                try {
                    await this.args.onResizeEnd(newStartDate, newEndDate);
                } finally {
                    if (this.args.updateDependencyPositions) {
                        this.args.updateDependencyPositions();
                    }
                }
            } else {
                this.resetResizeState();
            }
        } else {
            this.resetResizeState();
        }
    }

    /**
     * Reset the resize state
     *
     * @method resetResizeState
     * @public
     */
    @action resetResizeState() {
        this.isResizing = false;
        this.resizeHandle = null;
        this.resizeOffset = 0;
        this.resizeStartX = 0;
        this.originalStartDate = null;
        this.originalEndDate = null;
        this.originalWidth = 0;
        this.originalLeftForResize = 0;
        this.lastMouseX = 0;
        this.accumulatedScrollDeltaX = 0;
        if (this.args.onStopAutoScroll) {
            this.args.onStopAutoScroll();
        }
    }

    /**
     * Get the effective bar width including resize offset
     *
     * @property effectiveBarWidth
     * @type Number
     * @for GanttBar
     * @public
     */
    get effectiveBarWidth() {
        if (this.isResizing) {
            if (this.resizeHandle === 'right') {
                // Resizing from right: width increases/decreases
                return Math.max(this.args.dayWidth, this.originalWidth + this.resizeOffset);
            } else if (this.resizeHandle === 'left') {
                // Resizing from left: width decreases/increases (inverse of offset)
                return Math.max(this.args.dayWidth, this.originalWidth - this.resizeOffset);
            }
        }
        return this.barWidth;
    }

    /**
     * Get the effective bar left position including resize offset
     *
     * @property effectiveBarLeft
     * @type Number
     * @for GanttBar
     * @public
     */
    get effectiveBarLeft() {
        if (this.isResizing && this.resizeHandle === 'left') {
            // Resizing from left: position moves with offset
            return this.originalLeftForResize + this.resizeOffset;
        }
        return this.barLeft;
    }

    /**
     * Calculate accumulated time (hours and minutes) for a given context (spent or estimated)
     *
     * @method calculateTimeForContext
     * @param {String} context The context ('spent' or 'estimated')
     * @returns {Object} Object with hours and minutes
     * @public
     */
    calculateTimeForContext(context) {
        if (!this.args.issue || !this.args.issue[context]) {
            return { hours: 0, minutes: 0 };
        }

        let totalHours = 0;
        let totalMinutes = 0;

        const timelogs = this.args.issue[context];
        if (timelogs && timelogs.length > 0) {
            timelogs.forEach((timelog) => {
                // Convert days to hours (8 hours per day)
                const daysToHours = (timelog.days || 0) * 8;
                const hours = parseInt(timelog.hours || 0, 10) + parseInt(daysToHours, 10);
                const minutes = parseInt(timelog.minutes || 0, 10);

                totalHours += hours;
                totalMinutes += minutes;
            });
        }

        // Normalize minutes to ensure they don't exceed 60
        const normalized = DateUtils.normalizeMinutes(totalMinutes);
        totalHours += normalized.hours;
        totalMinutes = normalized.minutes;

        return {
            hours: totalHours,
            minutes: totalMinutes
        };
    }

    /**
     * Get the formatted tooltip content with estimated and spent hours, and modified info
     *
     * @property tooltipContent
     * @type String
     * @for GanttBar
     * @public
     */
    get tooltipContent() {
        if (this.args.type !== 'task' || !this.args.issue) {
            return '';
        }

        const estimated = this.calculateTimeForContext('estimated');
        const spent = this.calculateTimeForContext('spent');

        const formatTime = (time) => {
            const hrs = time.hours || 0;
            const mins = time.minutes || 0;
            return `${hrs}hrs ${mins} min`;
        };

        const modifiedByName = this.args.issue.modifiedBy.get('name');
        const formattedDateModified = moment(this.args.issue.dateModified).format("DD MMM 'YY, h:mm a");

        const estimatedLabel = this.intl.t('views.app.gantt.tooltip.estimatedHours');
        const spentLabel = this.intl.t('views.app.gantt.tooltip.spentHours');
        const modifiedByLabel = this.intl.t('views.app.gantt.tooltip.modifiedBy');
        const atLabel = this.intl.t('views.app.gantt.tooltip.at');

        let content = `<strong>${estimatedLabel}:</strong> ${formatTime(estimated)}<br><strong>${spentLabel}:</strong> ${formatTime(spent)}`;
        content += `<br><strong>${modifiedByLabel}:</strong> ${modifiedByName} ${atLabel} ${formattedDateModified}`;

        return content;
    }


    /**
     * Sync bar with scroll.
     *
     * @method syncBarWithScroll
     * @param {Number} scrollDeltaX The scroll delta in pixels
     * @private
     */
    syncBarWithScroll(scrollDeltaX) {
        this.accumulatedScrollDeltaX += scrollDeltaX;

        if (this.isDragging) {
            const currentDeltaX = this.lastMouseX ? this.lastMouseX - this.dragStartX : 0;
            this.dragOffset = currentDeltaX + this.accumulatedScrollDeltaX;
            if (this.args.onDragUpdate) {
                this.args.onDragUpdate(this.dragOffset);
            }
        } else if (this.isResizing) {
            const currentDeltaX = this.lastMouseX ? this.lastMouseX - this.resizeStartX : 0;
            this.resizeOffset = currentDeltaX + this.accumulatedScrollDeltaX;
            if (this.args.onResizeUpdate) {
                this.args.onResizeUpdate(this.resizeHandle, this.resizeOffset);
            }
        }
    }


    /**
     * Cleanup when component is destroyed
     *
     * @method willDestroy
     * @public
     */
    willDestroy() {
        super.willDestroy(...arguments);
        if (this.args.onStopAutoScroll) {
            this.args.onStopAutoScroll();
        }
    }

}
