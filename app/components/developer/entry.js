import Component from '@glimmer/component';
import { action } from '@ember/object';
import EventLog from 'prometheus/utils/developer/event-log';

/**
 * Frame of a Component Library entry: demo, controls, event log and docs.
 *
 * @class DeveloperEntry
 * @namespace Prometheus.Components
 * @extends Component
 */
export default class DeveloperEntryComponent extends Component {
	log = new EventLog();

	@action
	reset() {
		if (this.args.onReset) {
			this.args.onReset();
		}
	}
}
