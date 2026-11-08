import Component from '@glimmer/component';
import { action } from '@ember/object';
import EventLog from 'prometheus/utils/developer/event-log';

/**
 * Frame of a Component Library entry: demo, controls, event log and docs. Pass `@log` to share an
 * EventLog with the demo, so its callbacks can log from JavaScript; without it the entry makes its own.
 *
 * @class DeveloperEntry
 * @namespace Prometheus.Components
 * @extends Component
 */
export default class DeveloperEntryComponent extends Component {
	log = this.args.log || new EventLog();

	@action
	reset() {
		if (this.args.onReset) {
			this.args.onReset();
		}
	}
}
