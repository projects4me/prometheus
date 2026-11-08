import Component from '@glimmer/component';
import { action } from '@ember/object';

/**
 * Renders the events of an EventLog.
 *
 * @class DeveloperEventLog
 * @namespace Prometheus.Components
 * @extends Component
 */
export default class DeveloperEventLogComponent extends Component {
	get rows() {
		return this.args.log.entries.map((entry) => ({
			id: entry.id,
			name: entry.name,
			time: entry.time.toLocaleTimeString(),
			payload: this.payload(entry.args),
		}));
	}

	payload(args) {
		if (!args.length) {
			return '';
		}
		const seen = new WeakSet();
		let text;
		try {
			text = JSON.stringify(args.length === 1 ? args[0] : args, (key, value) => {
				if (typeof value === 'function') {
					return '[function]';
				}
				if (value && typeof value === 'object') {
					if (seen.has(value)) {
						return '[circular]';
					}
					seen.add(value);
				}
				return value;
			});
		} catch (e) {
			text = String(args[0]);
		}
		text = text === undefined ? '' : text;
		return text.length > 120 ? `${text.slice(0, 117)}...` : text;
	}

	@action
	clear() {
		this.args.log.clear();
	}
}
