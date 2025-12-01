/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { calculateBarWidth, calculateBarPosition } from 'prometheus/utils/gantt-helpers';
import { next } from '@ember/runloop';

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
     * Store the starting X position of the drag
     *
     * @property dragStartX
     * @type Number
     * @for GanttBar
     * @private
     */
    dragStartX = 0;

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
        return this.barWidth > 100 && this.displayLabel;
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
     * Action to handle mouse down on bar (start drag)
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

        // Only allow dragging for task bars, not milestone bars
        if (this.args.type !== 'task') {
            return;
        }

        // Don't start drag if clicking on connector dots
        if (event.target.closest('.connector-dot')) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();
        
        this.isDragging = false; // Will be set to true if mouse moves
        this.dragStartX = event.clientX;
        this.originalLeft = this.barLeft;
        this.dragOffset = 0;

        // Add event listeners to document for mouse move and up
        document.addEventListener('mousemove', this.handleMouseMove);
        document.addEventListener('mouseup', this.handleMouseUp);
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
            this.dragOffset = deltaX;
            // Notify drag update
            if (this.args.onDragUpdate) {
                this.args.onDragUpdate(this.dragOffset);
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
     * Handle hover to toggle connectors
     *
     * @method handleMouseEnter
     * @public
     */
    @action handleMouseEnter() {
        this.isHovering = true;
    }

    /**
     * Handle mouse leave to hide connectors
     *
     * @method handleMouseLeave
     * @public
     */
    @action handleMouseLeave() {
        this.isHovering = false;
    }

    /**
     * Handle starting a dependency drag from a connector
     *
     * @method handleConnectorMouseDown
     * @param {String} position
     * @param {Event} event
     * @public
     */
    @action handleConnectorMouseDown(position, event) {
        event.preventDefault();
        event.stopPropagation();

        if (this.args.onConnectorMouseDown && this.args.issue) {
            this.args.onConnectorMouseDown(this.args.issue, position, event);
        }
    }

    /**
     * Handle completing a dependency drag on a connector
     *
     * @method handleConnectorMouseUp
     * @param {String} position
     * @param {Event} event
     * @public
     */
    @action handleConnectorMouseUp(position, event) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        if (this.args.onConnectorMouseUp && this.args.issue) {
            this.args.onConnectorMouseUp(this.args.issue, position, event);
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
        const left = this.barLeft + this.dragOffset;
        element.style.left = `${left}px`;
        element.style.width = `${this.barWidth}px`;
        if (this.isDragging) {
            element.style.opacity = '0.7';
            element.style.cursor = 'grabbing';
        } else {
            element.style.opacity = '';
            element.style.cursor = '';
        }

        // For smooth transition of dependency positions
        if (this.args.updateDependencyPositions) {
            let times = 0;
            let updateDepPos = () => {
                element = $(element);
                let updatedLeft = this.barLeft + this.dragOffset;
                this.args.updateDependencyPositions(updatedLeft);
                times++;
                if (times < 5) {
                    requestAnimationFrame(updateDepPos);
                }
            };
            requestAnimationFrame(updateDepPos.bind(this));
        }
    }

    /**
     * Get the effective bar class including dragging state
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
        
        return classes.join(' ');
    }
}
