/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { htmlSafe } from '@ember/template';
import { tracked } from '@glimmer/tracking';
import Viewport from 'prometheus/utils/workflow/viewport';
import { HEADER_HEIGHT, NODE_WIDTH, bounds, edgePath, inputPoint, outputPoint } from 'prometheus/utils/workflow/node-geometry';
import { NODE_DRAG_TYPE } from 'prometheus/utils/workflow/node-catalog';

/**
 * How far the pointer moves before a press counts as a drag
 *
 * @property DRAG_THRESHOLD
 * @type Number
 * @private
 */
const DRAG_THRESHOLD = 4;

/**
 * The zoom step of the buttons and the mouse wheel
 *
 * @property ZOOM_STEP
 * @type Number
 * @private
 */
const ZOOM_STEP = 1.2;

/**
 * The flow canvas of the workflow editor: draws the nodes and the edges between their ports on an SVG layer,
 * and turns the pointer into edits: drop a palette kind to add a node, drag a node to move it, drag (or click)
 * an output port onto an input port to connect them, click an edge to select it, drag the background to pan,
 * and zoom with the wheel or the box tools. The edits go to the caller; the canvas keeps only the view.
 *
 * @class WorkflowFlowCanvasComponent
 * @namespace Prometheus.Components
 * @extends Glimmer.Component
 */
export default class WorkflowFlowCanvasComponent extends Component {
    /**
     * @property viewport
     * @type Viewport
     * @public
     */
    viewport = new Viewport();

    /**
     * The connection being drawn: the node and port it leaves from and the canvas point it reaches
     *
     * @property pending
     * @type Object
     * @public
     */
    @tracked pending = null;

    /**
     * @property selectedEdge
     * @type GraphEdge
     * @public
     */
    @tracked selectedEdge = null;

    /**
     * The press being tracked: pan, node move or connection
     *
     * @property press
     * @type Object
     * @private
     */
    press = null;

    /**
     * The viewport element
     *
     * @property element
     * @type HTMLElement
     * @private
     */
    element = null;

    /**
     * @property layerStyle
     * @type SafeString
     * @public
     */
    get layerStyle() {
        return htmlSafe(`transform: ${this.viewport.transform};`);
    }

    /**
     * @property zoomPercent
     * @type Number
     * @public
     */
    get zoomPercent() {
        return Math.round(this.viewport.scale * 100);
    }

    /**
     * The edges with their SVG paths
     *
     * @property edgeViews
     * @type Array
     * @public
     */
    get edgeViews() {
        return (this.args.graph?.edges ?? []).map(edge => {
            let index = Math.max(edge.from.ports.indexOf(edge.port), 0);
            return {
                edge,
                path: edgePath(outputPoint(edge.from, index), inputPoint(edge.to)),
                selected: edge === this.selectedEdge,
                invalid: edge.errors.length > 0
            };
        });
    }

    /**
     * The path of the connection being drawn
     *
     * @property pendingPath
     * @type String
     * @public
     */
    get pendingPath() {
        let pending = this.pending;
        if (!pending?.point) {
            return null;
        }
        let index = Math.max(pending.node.ports.indexOf(pending.port), 0);
        return edgePath(outputPoint(pending.node, index), pending.point);
    }

    /**
     * Keeps the viewport element and fits the graph into it
     *
     * @method setup
     * @param {HTMLElement} element
     * @public
     */
    @action setup(element) {
        this.element = element;
        this.fit();
    }

    /**
     * @method zoomIn
     * @public
     */
    @action zoomIn() {
        let { width, height } = this._size();
        this.viewport.zoomBy(ZOOM_STEP, width / 2, height / 2);
    }

    /**
     * @method zoomOut
     * @public
     */
    @action zoomOut() {
        let { width, height } = this._size();
        this.viewport.zoomBy(1 / ZOOM_STEP, width / 2, height / 2);
    }

    /**
     * Zooms and pans so every node shows
     *
     * @method fit
     * @public
     */
    @action fit() {
        let { width, height } = this._size();
        this.viewport.fit(bounds(this.args.graph?.nodes ?? []), width, height);
    }

    /**
     * @method zoomWithWheel
     * @param {WheelEvent} event
     * @public
     */
    @action zoomWithWheel(event) {
        event.preventDefault();
        let point = this._local(event);
        this.viewport.zoomBy(event.deltaY < 0 ? ZOOM_STEP : 1 / ZOOM_STEP, point.x, point.y);
    }

    /**
     * A press on the background pans the canvas and drops the selection
     *
     * @method pressBackground
     * @param {PointerEvent} event
     * @public
     */
    @action pressBackground(event) {
        if (event.button !== 0 || event.target.closest('[data-workflow-node], [data-workflow-edge]')) {
            return;
        }
        this.pending = null;
        this.selectedEdge = null;
        this._startPress(event, { type: 'pan', lastX: event.clientX, lastY: event.clientY });
    }

    /**
     * A press on a node header selects the node and starts moving it
     *
     * @method pressNode
     * @param {GraphNode} node
     * @param {PointerEvent} event
     * @public
     */
    @action pressNode(node, event) {
        if (event.button !== 0 || event.target.closest('[data-input-port]')) {
            return;
        }
        event.stopPropagation();
        this.selectedEdge = null;
        this.args.onSelect?.(node);
        this._startPress(event, { type: 'node', node, originX: node.x, originY: node.y });
    }

    /**
     * A press on an output port starts a connection
     *
     * @method pressPort
     * @param {GraphNode} node
     * @param {String} port
     * @param {PointerEvent} event
     * @public
     */
    @action pressPort(node, port, event) {
        event.stopPropagation();
        if (this.args.locked || event.button !== 0) {
            return;
        }
        this.selectedEdge = null;
        this.pending = { node, port, point: null };
        this._startPress(event, { type: 'connect' });
    }

    /**
     * A click on an input port ends a connection started with a click on an output port
     *
     * @method clickInput
     * @param {GraphNode} node
     * @param {Event} event
     * @public
     */
    @action clickInput(node, event) {
        event.stopPropagation();
        this._finishConnection(node);
    }

    /**
     * @method movePointer
     * @param {PointerEvent} event
     * @public
     */
    @action movePointer(event) {
        let press = this.press;
        if (!press) {
            return;
        }
        let dx = event.clientX - press.startX;
        let dy = event.clientY - press.startY;
        press.moved = press.moved || Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD;
        if (press.type === 'pan') {
            this.viewport.panBy(event.clientX - press.lastX, event.clientY - press.lastY);
            press.lastX = event.clientX;
            press.lastY = event.clientY;
        } else if (press.type === 'node' && press.moved) {
            let scale = this.viewport.scale;
            this.args.onMove?.(press.node, press.originX + dx / scale, press.originY + dy / scale);
        } else if (press.type === 'connect' && this.pending) {
            let point = this._local(event);
            this.pending = { ...this.pending, point: this.viewport.toCanvas(point.x, point.y) };
        }
    }

    /**
     * Ends a press; a connection dragged onto an input port is made there, a port that was only clicked
     * waits for a click on an input port
     *
     * @method releasePointer
     * @param {PointerEvent} event
     * @public
     */
    @action releasePointer(event) {
        let press = this.press;
        this.press = null;
        if (press?.type !== 'connect' || !press.moved) {
            return;
        }
        let target = document.elementFromPoint(event.clientX, event.clientY)?.closest('[data-input-port]');
        let node = target && (this.args.graph?.nodes ?? []).find(other => other.key === target.dataset.inputPort);
        if (node) {
            this._finishConnection(node);
        } else {
            this.pending = null;
        }
    }

    /**
     * @method selectEdge
     * @param {GraphEdge} edge
     * @param {Event} event
     * @public
     */
    @action selectEdge(edge, event) {
        event.stopPropagation();
        this.pending = null;
        this.selectedEdge = edge;
    }

    /**
     * @method removeSelectedEdge
     * @public
     */
    @action removeSelectedEdge() {
        if (this.selectedEdge) {
            this.args.onRemoveEdge?.(this.selectedEdge);
            this.selectedEdge = null;
        }
    }

    /**
     * @method allowDrop
     * @param {DragEvent} event
     * @public
     */
    @action allowDrop(event) {
        if (!this.args.locked && event.dataTransfer?.types?.includes(NODE_DRAG_TYPE)) {
            event.preventDefault();
            event.dataTransfer.dropEffect = 'copy';
        }
    }

    /**
     * Adds the dropped palette kind where it was dropped
     *
     * @method drop
     * @param {DragEvent} event
     * @public
     */
    @action drop(event) {
        let data = event.dataTransfer?.getData(NODE_DRAG_TYPE);
        if (!data || this.args.locked) {
            return;
        }
        event.preventDefault();
        let { category, kind } = JSON.parse(data);
        let local = this._local(event);
        let point = this.viewport.toCanvas(local.x, local.y);
        this.args.onAdd?.(category, kind, { x: point.x - NODE_WIDTH / 2, y: point.y - HEADER_HEIGHT / 2 });
    }

    /**
     * @method _finishConnection
     * @param {GraphNode} node
     * @private
     */
    _finishConnection(node) {
        let pending = this.pending;
        this.pending = null;
        if (pending && !this.args.locked) {
            this.args.onConnect?.(pending.node, pending.port, node);
        }
    }

    /**
     * @method _startPress
     * @param {PointerEvent} event
     * @param {Object} press
     * @private
     */
    _startPress(event, press) {
        this.press = { ...press, startX: event.clientX, startY: event.clientY, moved: false };
        try {
            this.element?.setPointerCapture(event.pointerId);
        } catch (e) {
            // a synthetic event has no active pointer to capture
        }
    }

    /**
     * The event's point relative to the viewport element
     *
     * @method _local
     * @param {MouseEvent} event
     * @return {Object} x and y
     * @private
     */
    _local(event) {
        let rect = this.element?.getBoundingClientRect() ?? { left: 0, top: 0 };
        return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    }

    /**
     * @method _size
     * @return {Object} width and height of the viewport element
     * @private
     */
    _size() {
        return { width: this.element?.clientWidth ?? 0, height: this.element?.clientHeight ?? 0 };
    }
}
