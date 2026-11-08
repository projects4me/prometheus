/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';

/**
 * Bar shown while QuickList rows are selected: select-all, count, actions and clear.
 *
 * @class QuickListSelectionBarComponent
 * @namespace Prometheus.Components
 * @extends Component
 *
 * @example
 * <QuickList::SelectionBar @count={{2}} @state="some" @onToggleAll={{this.toggleAll}} @onClear={{this.clear}}>
 *   <:actions><button type="button">Delete</button></:actions>
 * </QuickList::SelectionBar>
 */
export default class QuickListSelectionBarComponent extends Component {
	@action
	clear() {
		this.args.onClear?.();
	}
}
