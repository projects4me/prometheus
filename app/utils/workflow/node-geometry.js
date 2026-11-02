/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

/**
 * The size of a node on the workflow canvas and where its ports sit, so the node and the edges drawn
 * between nodes agree. Points are in canvas units, before pan and zoom.
 *
 * @class NodeGeometry
 * @namespace Prometheus.Utils.Workflow
 */

/**
 * @property NODE_WIDTH
 * @type Number
 * @public
 */
export const NODE_WIDTH = 200;

/**
 * The height of the node header, which holds the name and the input port
 *
 * @property HEADER_HEIGHT
 * @type Number
 * @public
 */
export const HEADER_HEIGHT = 40;

/**
 * The height of one output port row
 *
 * @property PORT_HEIGHT
 * @type Number
 * @public
 */
export const PORT_HEIGHT = 22;

/**
 * The coloured top border of a node
 *
 * @property NODE_BORDER_TOP
 * @type Number
 * @public
 */
export const NODE_BORDER_TOP = 3;

/**
 * The space above and below the output port rows
 *
 * @property PORTS_MARGIN
 * @type Number
 * @public
 */
export const PORTS_MARGIN = 4;

/**
 * The height of a node with this many output ports, borders included
 *
 * @method nodeHeight
 * @param {Number} portCount
 * @return {Number}
 * @public
 */
export function nodeHeight(portCount) {
    return NODE_BORDER_TOP + HEADER_HEIGHT + Math.max(portCount, 1) * PORT_HEIGHT + 2 * PORTS_MARGIN + 1;
}

/**
 * Where edges arrive at a node
 *
 * @method inputPoint
 * @param {Object} node with x and y
 * @return {Object} x and y
 * @public
 */
export function inputPoint(node) {
    return { x: node.x, y: node.y + NODE_BORDER_TOP + HEADER_HEIGHT / 2 };
}

/**
 * Where edges leave a node from its output port at this index
 *
 * @method outputPoint
 * @param {Object} node with x and y
 * @param {Number} index
 * @return {Object} x and y
 * @public
 */
export function outputPoint(node, index) {
    return { x: node.x + NODE_WIDTH, y: node.y + NODE_BORDER_TOP + HEADER_HEIGHT + PORTS_MARGIN + index * PORT_HEIGHT + PORT_HEIGHT / 2 };
}

/**
 * The SVG path of an edge between two points, a curve that leaves to the right and arrives from the left
 *
 * @method edgePath
 * @param {Object} from x and y
 * @param {Object} to x and y
 * @return {String}
 * @public
 */
export function edgePath(from, to) {
    let bend = Math.max(40, Math.abs(to.x - from.x) / 2);
    return `M ${from.x} ${from.y} C ${from.x + bend} ${from.y}, ${to.x - bend} ${to.y}, ${to.x} ${to.y}`;
}

/**
 * The box around nodes, or null when there are none
 *
 * @method bounds
 * @param {Array} nodes each with x, y and ports
 * @return {Object} minX, minY, maxX and maxY
 * @public
 */
export function bounds(nodes) {
    if (!nodes.length) {
        return null;
    }
    return nodes.reduce((box, node) => ({
        minX: Math.min(box.minX, node.x),
        minY: Math.min(box.minY, node.y),
        maxX: Math.max(box.maxX, node.x + NODE_WIDTH),
        maxY: Math.max(box.maxY, node.y + nodeHeight(node.ports.length))
    }), { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity });
}
