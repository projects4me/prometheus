/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Service from "@ember/service";
import io from "socket.io-client";
import { service } from "@ember/service";
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
     * The session service (services/session.js). Used for the OAuth
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
     * Socket.IO client factory. Tests replace it with a stub.
     *
     * @property socketFactory
     * @type Function
     * @for HermesService
     * @private
     */
    socketFactory = io;

    /**
     * Auth refusals in a row since the last successful connect.
     *
     * @property authRetries
     * @type Number
     * @for HermesService
     * @private
     */
    authRetries = 0;

    /**
     * Most auth-refusal reconnects before giving up.
     *
     * @property maxAuthRetries
     * @type Number
     * @for HermesService
     * @private
     */
    maxAuthRetries = 3;

    /**
     * Base backoff in ms before an auth-refusal reconnect (doubles per try).
     *
     * @property authRetryDelayMs
     * @type Number
     * @for HermesService
     * @private
     */
    authRetryDelayMs = 1000;

    /**
     * Bound disconnect handler.
     *
     * @property disconnectHandler
     * @type Function|null
     * @for HermesService
     * @private
     */
    disconnectHandler = null;

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
     * Opens the session socket, or reuses the open one. The handshake `auth`
     * is a callback, so every handshake and reconnect sends the session's
     * current access token; the service keeps no copy of it.
     *
     * @method connect
     * @returns {Object|null} The Socket.IO client
     * @public
     */
    connect() {
        if (this.socket) {
            return this.socket;
        }

        this.authRetries = 0;
        this.socket = this.socketFactory(resolveHermesUrl(config.hermes?.url), {
            auth: (cb) =>
                cb({ token: this.session.data?.authenticated?.access_token || null }),
            transports: ["polling", "websocket"],
            withCredentials: false,
            timeout: 20000,
        });
        let socket = this.socket;

        this.connectHandler = () => {
            this.authRetries = 0;
            this.reconcileIntents(true);
        };
        this.disconnectHandler = (reason) => {
            if (reason === "io server disconnect") {
                this.reconnectWithFreshToken(socket);
            }
        };
        this.connectErrorHandler = (err) => {
            this.lastError = err;
            if (err && err.message === "unauthorized") {
                this.retryAfterAuthRefusal(socket);
            }
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
        this.socket.on("disconnect", this.disconnectHandler);
        this.socket.on("connect_error", this.connectErrorHandler);
        this.socket.on("domain:event", this.domainEventHandler);
        return this.socket;
    }

    /**
     * After the server closed the socket (token expiry or access recheck),
     * refreshes the session token and reconnects while the session is still
     * authenticated and this socket is still the service's socket.
     *
     * @method reconnectWithFreshToken
     * @param {Object} socket The socket that was closed
     * @returns {Promise<void>}
     * @private
     */
    async reconnectWithFreshToken(socket) {
        try {
            await this.session.ensureFreshToken();
        } catch (err) {
            this.lastError = err;
            console.error("Hermes token refresh failed", err && err.message);
            return;
        }
        if (this.isDestroying || this.isDestroyed) {
            return;
        }
        if (this.socket === socket && this.session.isAuthenticated) {
            socket.connect();
        }
    }

    /**
     * After an auth refusal on the handshake, refreshes the token and tries
     * again with a growing delay, up to maxAuthRetries times.
     *
     * @method retryAfterAuthRefusal
     * @param {Object} socket The socket that was refused
     * @returns {Promise<void>}
     * @private
     */
    async retryAfterAuthRefusal(socket) {
        if (this.authRetries >= this.maxAuthRetries) {
            console.error("Hermes auth refused; giving up");
            return;
        }
        let delay = this.authRetryDelayMs * 2 ** this.authRetries;
        this.authRetries += 1;
        await new Promise((resolve) => setTimeout(resolve, delay));
        await this.reconnectWithFreshToken(socket);
    }

    /**
     * Closes the socket (no reconnect: a client disconnect) and clears handlers. Registrations are kept
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
            if (this.disconnectHandler) {
                this.socket.off("disconnect", this.disconnectHandler);
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
        this.connectHandler = null;
        this.disconnectHandler = null;
        this.connectErrorHandler = null;
        this.domainEventHandler = null;
    }

    /**
     * Register the events owned by one mounted route. Registering the same
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
                protocolVersion: 1,
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
     * @param {Object} envelope Domain-event envelope
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
     * @param {Object} envelope Domain-event envelope
     * @returns {void}
     * @private
     */
    dispatchDomainEvent(envelope) {
        if (
            !envelope ||
            envelope.schemaVersion !== 1 ||
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
