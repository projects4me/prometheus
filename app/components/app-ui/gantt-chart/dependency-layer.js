/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { buildElbowPath } from 'prometheus/utils/gantt/elbow-path';

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
        element.addEventListener('click', this.handleCanvasClick);
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
     * Handle clicking on canvas to deselect active dependency or dismiss linking state
     *
     * @method handleCanvasClick
     * @param {Event} event
     * @public
     */
    @action handleCanvasClick(event) {
        // Only handle left clicks
        if (event.button !== 0 && event.button !== undefined) {
            return;
        }

        const target = event.target;
        
        // If clicking on SVG canvas (not on a dependency line)
        if (target.tagName === 'svg') {
            this.activeDependencyId = null;
            
            // If there's an active linking state, dismiss it
            // Note: Clicks on connector dots should be stopped by stopPropagation
            // in the connector click handler, so they won't reach here
            if (this.args.linkingState) {
                // Check if we're clicking on a connector dot
                const isConnectorDot = target.closest && target.closest('.connector-dot');
                if (!isConnectorDot && this.args.onCancelDependencyLink) {
                    this.args.onCancelDependencyLink();
                }
            }
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
                toIssueId: dependency.toIssueId,
                selected: this.isSelectedLink(dependency)
            });
        });

        this.lines = lines;
        this.previewLine = this.buildPreviewLine(containerRect, scrollOffsets, registry);
    }

    /**
     * Whether the selected issue is either end of the dependency
     *
     * @method isSelectedLink
     * @param {Object} dependency
     * @returns {Boolean}
     * @public
     */
    isSelectedLink(dependency) {
        let selectedId = this.args.selectedIssueId;

        if (selectedId === undefined || selectedId === null) {
            return false;
        }

        return String(dependency.fromIssueId) === String(selectedId) ||
            String(dependency.toIssueId) === String(selectedId);
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
     * Build the elbow path string between two coordinates
     *
     * @method buildPath
     * @param {{x:Number,y:Number}} start
     * @param {{x:Number,y:Number}} end
     * @returns {String}
     * @private
     */
    buildPath(start, end) {
        return buildElbowPath(start, end, this.args.rowHeight);
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
        this.element?.removeEventListener('click', this.handleCanvasClick);
        this.closeContextMenu();
    }
}

