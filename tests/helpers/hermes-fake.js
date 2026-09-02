/**
 * Fake Socket.IO client for Prometheus Hermes tests. Keeps the real
 * `service:hermes` (register / dispatch / echo) but never opens a network
 * connection. Used by QUnit and by Yadda features annotated @setupHermesFake.
 */

/**
 * Minimal Socket.IO surface used by HermesService.
 *
 * @class FakeSocket
 */
export class FakeSocket {
	constructor() {
		this.connected = false;
		this.handlers = Object.create(null);
		this.emissions = [];
	}

	/**
	 * Register a listener for a socket event name.
	 *
	 * @method on
	 * @param {String} event
	 * @param {Function} handler
	 * @returns {void}
	 */
	on(event, handler) {
		if (!this.handlers[event]) {
			this.handlers[event] = [];
		}
		this.handlers[event].push(handler);
	}

	/**
	 * Remove a listener, or all listeners for `event` when handler is omitted.
	 *
	 * @method off
	 * @param {String} event
	 * @param {Function} [handler]
	 * @returns {void}
	 */
	off(event, handler) {
		let list = this.handlers[event];
		if (!list) {
			return;
		}
		if (!handler) {
			delete this.handlers[event];
			return;
		}
		this.handlers[event] = list.filter((item) => item !== handler);
	}

	/**
	 * Record an emission. For `intents:set`, immediately ack as accepted.
	 *
	 * @method emit
	 * @param {String} name
	 * @param {*} payload
	 * @param {Function} [ack]
	 * @returns {void}
	 */
	emit(name, payload, ack) {
		this.emissions.push({ name, payload });
		if (name === 'intents:set' && typeof ack === 'function') {
			ack({
				revision: payload.revision,
				accepted: payload.intents,
				rejected: [],
			});
		}
	}

	/**
	 * Mark disconnected and clear all handlers.
	 *
	 * @method disconnect
	 * @returns {void}
	 */
	disconnect() {
		this.connected = false;
		this.handlers = Object.create(null);
	}

	/**
	 * Invoke local listeners as if the server emitted `event`.
	 *
	 * @method serverEmit
	 * @param {String} event
	 * @param {*} payload
	 * @returns {void}
	 */
	serverEmit(event, payload) {
		(this.handlers[event] || []).forEach((handler) => handler(payload));
	}

	/**
	 * Mark connected and fire the connect handler (forces intent resend).
	 *
	 * @method simulateConnect
	 * @returns {void}
	 */
	simulateConnect() {
		this.connected = true;
		this.serverEmit('connect');
	}

	/**
	 * Mark disconnected and fire connect_error (no UI toast — console only).
	 *
	 * @method simulateConnectError
	 * @param {Error|Object} err
	 * @returns {void}
	 */
	simulateConnectError(err = new Error('Hermes unavailable')) {
		this.connected = false;
		this.serverEmit('connect_error', err);
	}

	/**
	 * Most recent `intents:set` payload, or null when none was emitted.
	 *
	 * @method lastIntentsSet
	 * @returns {Object|null}
	 */
	lastIntentsSet() {
		for (let i = this.emissions.length - 1; i >= 0; i--) {
			if (this.emissions[i].name === 'intents:set') {
				return this.emissions[i].payload;
			}
		}
		return null;
	}
}

/**
 * Override hermes.connect() for the test lifetime so io() is never called.
 *
 * @method installFakeHermes
 * @param {Object} hooks QUnit hooks
 * @returns {void}
 */
export function installFakeHermes(hooks) {
	hooks.beforeEach(function () {
		let hermes = this.owner.lookup('service:hermes');
		let originalConnect = hermes.connect.bind(hermes);
		let originalDisconnect = hermes.disconnect.bind(hermes);

		hermes.connect = () => {
			let token = hermes.session.data?.authenticated?.access_token || null;
			if (hermes.socket && hermes.authToken === token) {
				return hermes.socket;
			}

			originalDisconnect();
			hermes.authToken = token;

			let socket = new FakeSocket();
			hermes.socket = socket;

			hermes.connectHandler = () => {
				hermes.reconcileIntents(true);
			};
			hermes.connectErrorHandler = (err) => {
				hermes.lastError = err;
				console.error(
					'Hermes connect_error',
					err && err.message ? err.message : err,
					{
						description: err && err.description,
						type: err && err.type,
					}
				);
			};
			hermes.domainEventHandler = (envelope) => {
				hermes.dispatchDomainEvent(envelope);
			};

			socket.on('connect', hermes.connectHandler);
			socket.on('connect_error', hermes.connectErrorHandler);
			socket.on('domain:event', hermes.domainEventHandler);
			socket.simulateConnect();
			return socket;
		};

		this._hermesFake = {
			hermes,
			originalConnect,
			restore() {
				hermes.connect = originalConnect;
			},
		};
	});

	hooks.afterEach(function () {
		this._hermesFake?.restore();
		this._hermesFake = null;
	});
}

/**
 * Yadda’s `$table` converter always treats the first row as column headers.
 * Live features use a two-column key/value table:
 *
 *   | key        | value   |
 *   | projectId  | 1       |
 *   | resourceId | issue-1 |
 *
 * A single horizontal data row (field names as headers) is also accepted.
 *
 * @method rowFromDomainEventTable
 * @param {Array<Object>} table
 * @returns {Object}
 */
export function rowFromDomainEventTable(table) {
	if (!table || !table.length) {
		return {};
	}
	let first = table[0];
	if (first.key !== undefined && first.value !== undefined) {
		let row = {};
		table.forEach((entry) => {
			if (entry.key !== undefined && entry.key !== '') {
				row[entry.key] = entry.value;
			}
		});
		return row;
	}
	return first;
}

/**
 * Build a domain-event envelope for tests.
 *
 * @method buildDomainEvent
 * @param {Object} options
 * @returns {Object}
 */
export function buildDomainEvent(options = {}) {
	let {
		eventName,
		projectId,
		resourceType = 'issue',
		resourceId,
		actorId = 'user_a',
		changes = {},
		meta = {},
		eventId = `evt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
		schemaVersion = 1,
	} = options;

	return {
		schemaVersion,
		eventId,
		eventName,
		occurredAt: new Date().toISOString(),
		projectId,
		resource: {
			type: resourceType,
			id: String(resourceId),
		},
		actorId,
		changes,
		meta: { source: 'test', ...meta },
	};
}

/**
 * Lookup hermes and dispatch a domain event (remote-user path).
 *
 * @method emitDomainEvent
 * @param {Object} owner Ember owner / test context with lookup
 * @param {Object} envelopeOrOptions Envelope or buildDomainEvent options
 * @returns {Object} The hermes service
 */
export function emitDomainEvent(owner, envelopeOrOptions) {
	let hermes = owner.lookup('service:hermes');
	let envelope =
		envelopeOrOptions.schemaVersion !== undefined
			? envelopeOrOptions
			: buildDomainEvent(envelopeOrOptions);
	hermes.dispatchDomainEvent(envelope);
	return hermes;
}

/**
 * Emit via the fake socket listener path (exercises domain:event wiring).
 *
 * @method emitDomainEventViaSocket
 * @param {Object} owner
 * @param {Object} envelopeOrOptions
 */
export function emitDomainEventViaSocket(owner, envelopeOrOptions) {
	let hermes = owner.lookup('service:hermes');
	let envelope =
		envelopeOrOptions.schemaVersion !== undefined
			? envelopeOrOptions
			: buildDomainEvent(envelopeOrOptions);
	if (hermes.socket && typeof hermes.socket.serverEmit === 'function') {
		hermes.socket.serverEmit('domain:event', envelope);
	} else {
		hermes.dispatchDomainEvent(envelope);
	}
	return hermes;
}
