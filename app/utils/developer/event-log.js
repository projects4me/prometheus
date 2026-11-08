import { tracked } from '@glimmer/tracking';

export const EVENT_LOG_LIMIT = 50;

/**
 * Collects the events fired by a Component Library demo, newest first.
 *
 * @class EventLog
 * @namespace Prometheus.Utils.Developer
 */
export default class EventLog {
	@tracked entries = [];

	_id = 0;

	constructor() {
		this.log = this.log.bind(this);
		this.wrap = this.wrap.bind(this);
		this.clear = this.clear.bind(this);
	}

	log(name, ...args) {
		const entry = { id: ++this._id, time: new Date(), name, args };
		this.entries = [entry, ...this.entries].slice(0, EVENT_LOG_LIMIT);
		return entry;
	}

	wrap(name, fn) {
		return (...args) => {
			this.log(name, ...args);
			return typeof fn === 'function' ? fn(...args) : undefined;
		};
	}

	clear() {
		this.entries = [];
	}
}
