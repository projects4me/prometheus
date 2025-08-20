/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';

/**
 * Component for rendering individual task nodes in the issue planning interface
 * This component handles the display and interaction of task nodes in a hierarchical structure
 *
 * @class IssuePlanTaskNodeComponent
 * @namespace Prometheus.Components.Issue
 * @extends Component
 * @public
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class IssuePlanTaskNodeComponent extends Component {
	/**
	 * Determines if the current node is a child node based on its level
	 * Child nodes are those with level greater than 0
	 *
	 * @property isChild
	 * @type {Boolean}
	 * @public
	 */
	get isChild() {
		return this.args.level > 0;
	}

	/**
	 * Generates the CSS style for indentation based on the node's level
	 * Each level adds 4rem of left margin for visual hierarchy
	 *
	 * @property indentStyle
	 * @type {String}
	 * @public
	 */
	get indentStyle() {
		return `margin-left: ${this.args.level * 4}rem;`;
	}

	/**
	 * Handles the retry action for a task node
	 * Calls the onRetry callback function if provided, passing the node and level as parameters
	 *
	 * @method handleRetry
	 * @public
	 * @async
	 * @returns {Promise<void>}
	 */
	@action
	async handleRetry() {
		if (typeof this.args.onRetry === 'function') {
			await this.args.onRetry(this.args.node, this.args.level);
		}
	}

	/**
	 * Handles the copy action for a task node
	 * Calls the onCopy callback function if provided, passing the node as parameter
	 *
	 * @method handleCopy
	 * @public
	 * @async
	 * @returns {Promise<void>}
	 */
	@action
	async handleCopy() {
		if (typeof this.args.onCopy === 'function') {
			await this.args.onCopy(this.args.node);
		}
	}
}
