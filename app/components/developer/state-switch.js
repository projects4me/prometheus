import Component from '@glimmer/component';

/**
 * Button group to force a demo into a state.
 *
 * @class DeveloperStateSwitch
 * @namespace Prometheus.Components
 * @extends Component
 */
export default class DeveloperStateSwitchComponent extends Component {
	get states() {
		return this.args.states || ['normal', 'loading', 'empty', 'error'];
	}
}
