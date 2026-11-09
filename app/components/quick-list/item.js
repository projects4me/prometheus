/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';

/**
 * One row of a `QuickList`: the row frame with the link, the active bar and the row separator.
 * `QuickList` yields it to its `<:item>` block with `@isActive` already set.
 *
 * Arguments:
 * - `@route` {String}: the route the row links to. Without it the row is not a link.
 * - `@model` {*}: optional model or id for `@route`.
 * - `@query` {Object}: optional query params of the link.
 * - `@isActive` {Boolean}: marks the open record with a crimson bar on the left.
 *
 * Named blocks:
 * - `<:leading>`: optional visual on the left of the row (an initials square, a priority icon, an avatar),
 *   in a column as wide as its content, top-aligned, 8px before the text. The primary and secondary lines
 *   then sit beside it, lined up under each other. With `@selectable` the row reads checkbox, leading,
 *   text. Without the block the row is exactly as before.
 * - `<:primary>`: the first line: a bold title that wraps, with anything after it (a status label)
 *   pushed to the right.
 * - `<:secondary>`: the second line: small grey text on one line, cut off with an ellipsis, with
 *   optional tags.
 *
 * @class QuickListItemComponent
 * @extends Component
 * @author Agent Odysseus
 *
 * @example
 * <QuickList::Item @route="app.idea.page" @model={{idea.id}} @isActive={{true}}>
 *   <:leading><span class="role-initials">AL</span></:leading>
 *   <:primary>
 *     <span>{{idea.name}}</span>
 *     <span class="label new">New</span>
 *   </:primary>
 *   <:secondary>{{idea.createdUserName}}</:secondary>
 * </QuickList::Item>
 */
export default class QuickListItemComponent extends Component {
	/**
	 * The models for `@route`: `@model` when it was passed, otherwise none.
	 *
	 * @property models
	 * @type {Array}
	 * @public
	 */
	get models() {
		let model = this.args.model;
		return model === undefined || model === null ? [] : [model];
	}

	/**
	 * The query params of the link: `@query` when it was passed, otherwise none.
	 *
	 * @property query
	 * @type {Object}
	 * @public
	 */
	get query() {
		return this.args.query ?? {};
	}
}
