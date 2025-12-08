/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

/**
 * Renders SVG connectors that represent task dependencies in the Gantt chart
 *
 * @class DependencyLayer
 * @namespace Prometheus.Components.AppUi.GanttChart
 * @extends Component
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class DependencyLayerComponent extends Component {

    /**
     * Collection of dependency line descriptors
     *
     * @property lines
     * @type Array
     * @public
     */
    @tracked lines = [];

    /**
     * Descriptor for the temporary line while creating a dependency
     *
     * @property previewLine
     * @type Object|null
     * @public
     */
    @tracked previewLine = null;

    /**
     * Reference to the SVG element for width/height adjustments
     *
     * @property element
     * @type SVGElement|null
     * @private
     */
    element = null;

    /**
     * Capture the SVG element once inserted in the DOM
     *
     * @method setupElement
     * @param {SVGElement} element
     * @public
     */
    @action setupElement(element) {
        this.element = element;
        this.refreshLines();
    }

    /**
     * Track the currently open context menu (if any)
     *
     * @property contextMenu
     * @type Object|null
     * @public
     */
    @tracked contextMenu = null;

    /**
     * Track the currently active/selected dependency line ID
     *
     * @property activeDependencyId
     * @type String|null
     * @public
     */
    @tracked activeDependencyId = null;

    /**
     * Handle left click on dependency line to make it active
     *
     * @method handleLineClick
     * @param {Object} line
     * @param {Event} event
     * @public
     */
    @action handleLineClick(line, event) {
        if (event.button !== 0 && event.button !== undefined) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();

        if (!line?.id) {
            return;
        }

        // Toggle active state: if clicking the same line, deselect it
        if (this.activeDependencyId === line.id) {
            this.activeDependencyId = null;
        } else {
            this.activeDependencyId = line.id;
        }
    }

    /**
     * Event handler for contextmenu events on dependency lines
     *
     * @method handleContextMenu
     * @param {Object} line
     * @param {Event} event
     * @private
     */
    @action handleContextMenu(line, event) {
        event.preventDefault();
        event.stopPropagation();

        if (!line?.fromIssueId || !line?.toIssueId) {
            return;
        }

        let container = this.args.timelineBodyElement;
        if (!container) {
            return;
        }

        let containerRect = container.getBoundingClientRect();

        let position = {
            x: event.clientX - containerRect.left + container.scrollLeft,
            y: event.clientY - containerRect.top + container.scrollTop
        };

        this.contextMenu = {
            ...position,
            fromIssueId: line.fromIssueId,
            toIssueId: line.toIssueId
        };

        document.addEventListener('click', this.handleGlobalClick, true);
        document.addEventListener('contextmenu', this.handleGlobalClick, true);
    }

    /**
     * Handle clicking delete within the context menu
     *
     * @method handleDeleteDependency
     * @public
     */
    @action handleDeleteDependency() {
        if (this.contextMenu && this.args.onDeleteDependency) {
            this.args.onDeleteDependency(
                this.contextMenu.fromIssueId,
                this.contextMenu.toIssueId
            );
        }
        this.closeContextMenu();
    }

    /**
     * Apply styles to context menu element
     *
     * @method applyContextMenuStyle
     * @param {HTMLElement} element
     * @public
     */
    @action
    applyContextMenuStyle(element) {
        if (element && this.contextMenu) {
            element.style.top = `${this.contextMenu.y}px`;
            element.style.left = `${this.contextMenu.x}px`;
        }
    }

    /**
     * Close the context menu
     *
     * @method closeContextMenu
     * @public
     */
    @action closeContextMenu() {
        this.contextMenu = null;
        document.removeEventListener('click', this.handleGlobalClick, true);
        document.removeEventListener('contextmenu', this.handleGlobalClick, true);
    }

    /**
     * Global click handler to close the menu when clicking outside
     *
     * @method handleGlobalClick
     * @param {Event} event
     * @private
     */
    @action handleGlobalClick(event) {
        if (
            !event.target.closest ||
            !event.target.closest('.dependency-context-menu')
        ) {
            this.closeContextMenu();
        }
    }

    /**
     * Handle clicking outside dependency lines to deselect active dependency
     *
     * @method handleCanvasClick
     * @param {Event} event
     * @public
     */
    @action handleCanvasClick(event) {
        const target = event.target;
        if (target.tagName === 'svg') {
            this.activeDependencyId = null;
        }
    }

    /**
     * Refresh the dependency lines whenever inputs change
     *
     * @method refreshLines
     * @public
     */
    @action refreshLines() {
        let container = this.args.timelineBodyElement;
        let registry = this.args.barRegistry || {};

        if (!container) {
            this.lines = [];
            this.previewLine = null;
            return;
        }

        let containerRect = container.getBoundingClientRect();
        let scrollOffsets = {
            left: container.scrollLeft,
            top: container.scrollTop
        };

        if (this.element) {
            this.element.setAttribute('height', container.scrollHeight || containerRect.height);
            this.element.setAttribute('width', this.args.timelineWidth || container.scrollWidth || containerRect.width);
        }

        let dependencies = this.args.dependencies || [];
        let lines = [];

        dependencies.forEach((dependency) => {
            let fromEl = registry[dependency.fromIssueId];
            let toEl = registry[dependency.toIssueId];

            if (!fromEl || !toEl) {
                return;
            }

            let start = this.getConnectorPoint(fromEl, 'end', containerRect, scrollOffsets);
            let end = this.getConnectorPoint(toEl, 'start', containerRect, scrollOffsets);

            if (!start || !end) {
                return;
            }

            lines.push({
                id: `${dependency.fromIssueId}-${dependency.toIssueId}`,
                path: this.buildPath(start, end),
                fromIssueId: dependency.fromIssueId,
                toIssueId: dependency.toIssueId
            });
        });

        this.lines = lines;
        this.previewLine = this.buildPreviewLine(containerRect, scrollOffsets, registry);
    }

    /**
     * Build the preview line descriptor if a link is in progress
     *
     * @method buildPreviewLine
     * @param {DOMRect} containerRect
     * @param {Object} scrollOffsets
     * @param {Object} registry
     * @returns {Object|null}
     * @private
     */
    buildPreviewLine(containerRect, scrollOffsets, registry) {
        let linkingState = this.args.linkingState;

        if (!linkingState || !linkingState.sourceIssue) {
            return null;
        }

        let sourceIssueId = linkingState.sourceIssue.id;
        let sourceElement = registry[sourceIssueId];

        if (!sourceElement) {
            return null;
        }

        let start = this.getConnectorPoint(sourceElement, linkingState.sourceAnchor, containerRect, scrollOffsets);
        let pointer = linkingState.pointer;

        if (!start || !pointer) {
            return null;
        }

        return {
            id: 'preview',
            path: this.buildPath(start, pointer),
            className: 'preview'
        };
    }

    /**
     * Calculate the connector coordinates relative to the container
     *
     * @method getConnectorPoint
     * @param {HTMLElement} element
     * @param {String} anchor
     * @param {DOMRect} containerRect
     * @param {Object} scrollOffsets
     * @returns {{x:Number,y:Number}|null}
     * @private
     */
    getConnectorPoint(element, anchor, containerRect, scrollOffsets) {
        if (!element || !containerRect) {
            return null;
        }

        // getBoundingClientRect() already includes the drag offset since it's applied via CSS
        // So we don't need to manually add it - the DOM position already reflects the current state
        const rect = element.getBoundingClientRect();
        const x = anchor === 'start' ? rect.left : rect.right;
        const y = rect.top + rect.height / 2;

        return {
            x: x - containerRect.left + scrollOffsets.left,
            y: y - containerRect.top + scrollOffsets.top
        };
    }

    /**
     * Build a smooth path string between two coordinates
     *
     * @method buildPath
     * @param {{x:Number,y:Number}} start
     * @param {{x:Number,y:Number}} end
     * @returns {String}
     * @private
     */
    buildPath(start, end) {
        if (!start || !end) {
            return '';
        }

        let adjustedStart = { ...start };
        let adjustedEnd = { ...end };
        const isTargetToLeft = end.x < start.x;
        
        if (isTargetToLeft) {
            adjustedStart.x = start.x +10;
        }

        if (isTargetToLeft) {
            const horizontalDistance = Math.abs(adjustedStart.x - adjustedEnd.x);
            const verticalDistance = Math.abs(end.y - start.y);
            
            const verticalOffset = Math.max(25, Math.min(50, horizontalDistance * 0.2));
            
            const initialCurveRight = 20;
            const initialCurveDown = verticalDistance < 15 ? Math.max(40, verticalOffset * 0.8) : 25;
            
            const control1X = start.x + initialCurveRight;
            const control1Y = start.y + initialCurveDown;
            
            const intermediateX = start.x - 20;
            const intermediateY = start.y + (verticalDistance < 15 ? Math.max(40, verticalOffset * 0.5) : 20);
            
            const intermediateControlX = start.x + initialCurveRight * 0.5;
            const intermediateControlY = start.y + initialCurveDown * 0.7;
            
            const control2X = intermediateX - Math.max(40, horizontalDistance * 0.35);
            const control2Y = intermediateY + (verticalDistance < 15 ? verticalOffset * 0.5 : 0);
            
            const control3X = adjustedEnd.x - Math.max(50, horizontalDistance * 0.8);
            const control3Y = adjustedEnd.y - (verticalDistance < 15 ? verticalOffset : 0);
            
            return `M ${start.x} ${start.y} C ${control1X} ${control1Y}, ${intermediateControlX} ${intermediateControlY}, ${intermediateX} ${intermediateY} C ${control2X} ${control2Y}, ${control3X} ${control3Y}, ${adjustedEnd.x} ${adjustedEnd.y}`;
        }

        const direction = 1;
        const deltaX = Math.max(30, Math.abs(adjustedEnd.x - start.x) / 2);
        const controlOffset = deltaX * direction;

        const control1X = start.x + controlOffset;
        const control2X = adjustedEnd.x - controlOffset;

        return `M ${start.x} ${start.y} C ${control1X} ${start.y}, ${control2X} ${adjustedEnd.y}, ${adjustedEnd.x} ${adjustedEnd.y}`;
    }

    /**
     * Cleanup when component is destroyed
     *
     * @method willDestroy
     * @public
     */
    @action
    willDestroy() {
        super.willDestroy(...arguments);
        this.closeContextMenu();
    }
}

