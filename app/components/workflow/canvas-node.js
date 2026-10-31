/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { htmlSafe } from '@ember/template';
import { CATEGORY_ICONS } from 'prometheus/utils/workflow/node-catalog';
import { HEADER_HEIGHT, NODE_WIDTH, PORT_HEIGHT, nodeHeight } from 'prometheus/utils/workflow/node-geometry';

/**
 * One node on the workflow canvas: its header, its input port and its output ports. It only presents; the
 * canvas handles the pointer.
 *
 * @class WorkflowCanvasNodeComponent
 * @namespace Prometheus.Components
 * @extends Glimmer.Component
 */
export default class WorkflowCanvasNodeComponent extends Component {
    /**
     * The position and size of the node, all numbers
     *
     * @property style
     * @type SafeString
     * @public
     */
    get style() {
        let node = this.args.node;
        return htmlSafe(`left: ${Number(node.x)}px; top: ${Number(node.y)}px; width: ${NODE_WIDTH}px; `
            + `height: ${nodeHeight(node.ports.length)}px;`);
    }

    /**
     * @property headerStyle
     * @type SafeString
     * @public
     */
    get headerStyle() {
        return htmlSafe(`height: ${HEADER_HEIGHT}px;`);
    }

    /**
     * @property portStyle
     * @type SafeString
     * @public
     */
    get portStyle() {
        return htmlSafe(`height: ${PORT_HEIGHT}px; line-height: ${PORT_HEIGHT}px;`);
    }

    /**
     * The step of the run shown over the flow that ran this node, if any
     *
     * @property step
     * @type Object
     * @public
     */
    get step() {
        return this.args.trace?.stepOf(this.args.node);
    }

    /**
     * @property icon
     * @type String
     * @public
     */
    get icon() {
        return CATEGORY_ICONS[this.args.node.category];
    }
}
