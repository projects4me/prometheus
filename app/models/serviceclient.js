/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Model, { attr } from '@ember-data/model';

/**
 * The identity of a service (a Talos runtime, Hermes) in Gaia. Service clients
 * are not users: they are enrolled elsewhere and an admin can only list them and
 * switch them between active and disabled.
 *
 * @class Serviceclient
 * @namespace Prometheus.Models
 * @extends DS.Model
 */
export default class ServiceclientModel extends Model {

    /**
     * Name of the service client
     *
     * @property name
     * @type String
     * @for Serviceclient
     * @public
     */
    @attr('string') name;

    /**
     * Kind of service: runtime or hermes
     *
     * @property kind
     * @type String
     * @for Serviceclient
     * @public
     */
    @attr('string') kind;

    /**
     * Status of the client: active or disabled
     *
     * @property status
     * @type String
     * @for Serviceclient
     * @public
     */
    @attr('string') status;

    /**
     * Scopes granted to the client
     *
     * @property scopes
     * @type Array
     * @for Serviceclient
     * @public
     */
    @attr() scopes;

    /**
     * When the client last asked for a token, null when it never did
     *
     * @property lastUsedAt
     * @type String
     * @for Serviceclient
     * @public
     */
    @attr('string') lastUsedAt;

    /**
     * Whether the client can get tokens
     *
     * @property isActive
     * @type Boolean
     * @for Serviceclient
     * @public
     */
    get isActive() {
        return this.status === 'active';
    }
}
