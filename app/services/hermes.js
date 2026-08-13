/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Service from "@ember/service";
import io from "socket.io-client";
import { inject as service } from "@ember/service";
import config from "prometheus/config/environment";
import { resolveHermesUrl } from "prometheus/utils/live/url";

/**
 * This service holds the signed-in tab's Socket.IO connection to Hermes. It
 * aggregates per-screen intent maps, sends `intents:set`, and fans
 * `domain:event` envelopes to matching owners. It does not apply board,
 * gantt, or conversation domain logic.
 *
 * @class HermesService
 * @namespace Prometheus.Services
 * @extends Ember.Service
 * @public
 */
export default class HermesService extends Service {
    /**
     * The session service offered by ember-simple-auth. Used for the OAuth
     * access token on the Socket.IO handshake.
     *
     * @property session
     * @type Ember.Service
     * @for HermesService
     * @public
     */
    @service session;

    /**
     * The open Socket.IO client, or null when disconnected.
     *
     * @property socket
     * @type Object|null
     * @for HermesService
     * @public
     */
    socket = null;

    /**
     * Access token last used to open the socket.
     *
     * @property authToken
     * @type String|null
     * @for HermesService
     * @private
     */
    authToken = null;

    /**
     * Bound connect handler that resends the current intent snapshot.
     *
     * @property connectHandler
     * @type Function|null
     * @for HermesService
     * @private
     */
    connectHandler = null;

    /**
     * Bound connect_error handler.
     *
     * @property connectErrorHandler
     * @type Function|null
     * @for HermesService
     * @private
     */
    connectErrorHandler = null;

    /**
     * Bound domain:event handler.
     *
     * @property domainEventHandler
     * @type Function|null
     * @for HermesService
     * @private
     */
    domainEventHandler = null;

    /**
     * Map of owner → { projectId, handlers } registrations.
     *
     * @property registrations
     * @type Map
     * @for HermesService
     * @private
     */
    registrations = new Map();

    /**
     * Last intents:set revision sent on this connection. Starts at -1.
     *
     * @property revision
     * @type Number
     * @for HermesService
     * @private
     */
    revision = -1;

    /**
     * Last acknowledgement returned by Hermes.
     *
     * @property lastAck
     * @type Object|null
     * @for HermesService
     * @public
     */
    lastAck = null;

    /**
     * Last connect or intent error.
     *
     * @property lastError
     * @type Error|null
     * @for HermesService
     * @public
     */
    lastError = null;

    /**
     * JSON signature of the last sent intent snapshot, used to skip no-ops.
     *
     * @property lastIntentSignature
     * @type String|null
     * @for HermesService
     * @private
     */
    lastIntentSignature = null;

    /**
     * Revision of the most recently emitted intents:set.
     *
     * @property lastSentRevision
     * @type Number
     * @for HermesService
     * @private
     */
    lastSentRevision = -1;

    /**
     * eventIds already dispatched, used to drop retries.
     *
     * @property seenEventIds
     * @type Set
     * @for HermesService
     * @private
     */
    seenEventIds = new Set();

    /**
     * Insertion order of seen eventIds so the set can be capped.
     *
     * @property recentEventIds
     * @type Array
     * @for HermesService
     * @private
     */
    recentEventIds = [];

    /**
     * Maximum number of eventIds retained for duplicate detection.
     *
     * @property maxSeenEvents
     * @type Number
     * @for HermesService
     * @private
     */
    maxSeenEvents = 200;

    /**
     * Map of "type:id" → expiry timestamp for writes this tab originated.
     *
     * @property localWrites
     * @type Map
     * @for HermesService
     * @private
     */
    localWrites = new Map();

    /**
     * How long a local write suppresses the matching domain:event echo.
     *
     * @property localWriteTtlMs
     * @type Number
     * @for HermesService
     * @private
     */
    localWriteTtlMs = 5000;

    /**
     * Opens (or reuses) the session socket authenticated with auth.token.
     *
     * @method connect
     * @returns {Object|null} The Socket.IO client
     * @public
     */
    connect() {
        let token = this.session.data?.authenticated?.access_token || null;
        if (this.socket && this.authToken === token) {
            return this.socket;
        }

        this.disconnect();
        this.authToken = token;
        this.socket = io(resolveHermesUrl(config.hermes?.url), {
            auth: { token },
            transports: ["polling", "websocket"],
            withCredentials: false,
            timeout: 20000,
        });

        this.connectHandler = () => {
            this.reconcileIntents(true);
        };
        this.connectErrorHandler = (err) => {
            this.lastError = err;
            console.error(
                "Hermes connect_error",
                err && err.message ? err.message : err,
                {
                    description: err && err.description,
                    type: err && err.type,
                }
            );
        };
        this.domainEventHandler = (envelope) => {
            this.dispatchDomainEvent(envelope);
        };
        this.socket.on("connect", this.connectHandler);
        this.socket.on("connect_error", this.connectErrorHandler);
        this.socket.on("domain:event", this.domainEventHandler);
        return this.socket;
    }

    /**
     * Closes the socket and clears handshake handlers. Registrations are kept
     * so a later connect can resend them.
     *
     * @method disconnect
     * @returns {void}
     * @public
     */
    disconnect() {
        if (this.socket) {
            if (this.connectHandler) {
                this.socket.off("connect", this.connectHandler);
            }
            if (this.connectErrorHandler) {
                this.socket.off("connect_error", this.connectErrorHandler);
            }
            if (this.domainEventHandler) {
                this.socket.off("domain:event", this.domainEventHandler);
            }
            this.socket.disconnect();
            this.socket = null;
        }
        this.authToken = null;
        this.connectHandler = null;
        this.connectErrorHandler = null;
        this.domainEventHandler = null;
    }

    /**
     * Register the V2 events owned by one mounted route. Registering the same
     * owner again replaces its previous registration. The returned disposer is
     * safe to invoke more than once and cannot remove a newer registration.
     *
     * @method register
     * @param {Object} owner The controller or service that owns the handlers
     * @param {String} projectId Project id, or user:<userId> for notifications
     * @param {Object} handlers Map of eventName → function(envelope)
     * @returns {Function} Disposer that unregisters this owner
     * @public
     */
    register(owner, projectId, handlers) {
        if (!owner || !projectId || !handlers) {
            throw new Error("Hermes register requires owner, projectId and handlers");
        }

        let registration = {
            projectId: String(projectId),
            handlers: { ...handlers },
        };
        this.registrations.set(owner, registration);
        this.connect();
        this.reconcileIntents();

        let disposed = false;
        return () => {
            if (disposed) {
                return;
            }
            disposed = true;
            if (this.registrations.get(owner) === registration) {
                this.registrations.delete(owner);
                this.reconcileIntents();
            }
        };
    }

    /**
     * Return the reference-counted aggregate desired intent set. Duplicate
     * project/event pairs from different owners appear only once.
     *
     * @property desiredIntents
     * @type Array
     * @for HermesService
     * @public
     */
    get desiredIntents() {
        let intents = new Map();
        this.registrations.forEach((registration) => {
            Object.keys(registration.handlers).forEach((eventName) => {
                if (typeof registration.handlers[eventName] !== "function") {
                    return;
                }
                let intent = {
                    projectId: registration.projectId,
                    eventName,
                };
                intents.set(`${intent.projectId}\u0000${eventName}`, intent);
            });
        });
        return Array.from(intents.values()).sort((left, right) => {
            return (
                left.projectId.localeCompare(right.projectId) ||
                left.eventName.localeCompare(right.eventName)
            );
        });
    }

    /**
     * Send a revisioned full snapshot. A reconnect always forces a new
     * revision because Hermes keeps intent state per socket.
     *
     * @method reconcileIntents
     * @param {Boolean} force When true, send even if the snapshot is unchanged
     * @returns {void}
     * @public
     */
    reconcileIntents(force = false) {
        if (!this.socket || !this.socket.connected) {
            return;
        }

        let intents = this.desiredIntents;
        let signature = JSON.stringify(intents);
        if (!force && signature === this.lastIntentSignature) {
            return;
        }
        this.lastIntentSignature = signature;
        this.revision++;
        let revision = this.revision;
        this.lastSentRevision = revision;

        this.socket.emit(
            "intents:set",
            {
                protocolVersion: 2,
                revision,
                intents,
            },
            (ack) => {
                this.handleIntentAck(revision, ack);
            }
        );
    }

    /**
     * Records the acknowledgement for the latest sent revision and logs
     * rejected intents.
     *
     * @method handleIntentAck
     * @param {Number} revision Revision this ack belongs to
     * @param {Object} ack Hermes { revision, accepted, rejected }
     * @returns {void}
     * @private
     */
    handleIntentAck(revision, ack) {
        if (revision < this.lastSentRevision) {
            return;
        }
        if (!ack || ack.revision !== revision) {
            this.lastError = new Error(
                `Hermes returned an invalid intent acknowledgement for revision ${revision}`
            );
            console.error(this.lastError.message, ack);
            return;
        }

        this.lastAck = ack;
        if (Array.isArray(ack.rejected) && ack.rejected.length > 0) {
            this.lastError = new Error(
                `Hermes rejected ${ack.rejected.length} intent(s)`
            );
            console.error(this.lastError.message, ack.rejected);
        } else {
            this.lastError = null;
        }
    }

    /**
     * Remember a REST write this tab just started so the matching domain:event
     * echo is not dispatched to controllers.
     *
     * @method noteLocalWrite
     * @param {String} type Ember Data model name
     * @param {String} id Record id
     * @param {Number} ttlMs How long to suppress the echo
     * @returns {void}
     * @public
     */
    noteLocalWrite(type, id, ttlMs = this.localWriteTtlMs) {
        if (!type || !id) {
            return;
        }
        this.localWrites.set(`${type}:${id}`, Date.now() + ttlMs);
    }

    /**
     * Returns true when this envelope matches a recent local write.
     *
     * @method isLocalEcho
     * @param {Object} envelope V2 domain-event envelope
     * @returns {Boolean}
     * @private
     */
    isLocalEcho(envelope) {
        let type = envelope?.resource?.type;
        let id = envelope?.resource?.id;
        if (!type || !id) {
            return false;
        }
        let key = `${type}:${id}`;
        let expiresAt = this.localWrites.get(key);
        if (expiresAt === undefined) {
            return false;
        }
        if (expiresAt > Date.now()) {
            return true;
        }
        this.localWrites.delete(key);
        return false;
    }

    /**
     * Fan one validated domain event out only to matching route owners.
     *
     * @method dispatchDomainEvent
     * @param {Object} envelope V2 domain-event envelope
     * @returns {void}
     * @private
     */
    dispatchDomainEvent(envelope) {
        if (
            !envelope ||
            envelope.schemaVersion !== 2 ||
            !envelope.projectId ||
            !envelope.eventName
        ) {
            return;
        }

        if (envelope.eventId) {
            if (this.seenEventIds.has(envelope.eventId)) {
                return;
            }
            this.seenEventIds.add(envelope.eventId);
            this.recentEventIds.push(envelope.eventId);
            if (this.recentEventIds.length > this.maxSeenEvents) {
                this.seenEventIds.delete(this.recentEventIds.shift());
            }
        }

        if (this.isLocalEcho(envelope)) {
            return;
        }

        this.registrations.forEach((registration) => {
            if (registration.projectId !== String(envelope.projectId)) {
                return;
            }
            let handler = registration.handlers[envelope.eventName];
            if (typeof handler === "function") {
                try {
                    handler(envelope);
                } catch (error) {
                    console.error(
                        `Hermes handler failed for ${envelope.eventName}`,
                        error
                    );
                }
            }
        });
    }

    /**
     * Removes every owner registration and sends an empty intent snapshot.
     *
     * @method clearRegistrations
     * @returns {void}
     * @public
     */
    clearRegistrations() {
        this.registrations.clear();
        this.reconcileIntents();
    }

    /**
     * Clears registrations and disconnects when the service is destroyed.
     *
     * @method willDestroy
     * @returns {void}
     * @public
     */
    willDestroy() {
        super.willDestroy(...arguments);
        this.clearRegistrations();
        this.disconnect();
    }
}
