import Component from '@glimmer/component';

/**
 * Header box of a Component Library entry.
 *
 * @class DeveloperEntryHeader
 * @namespace Prometheus.Components
 * @extends Component
 */
export default class DeveloperEntryHeaderComponent extends Component {
	get statusClass() {
		return this.args.entry.status === 'stable' ? 'label-success' : 'label-warning';
	}
}
