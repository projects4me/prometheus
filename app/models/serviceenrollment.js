/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Model, { attr } from '@ember-data/model';

/**
 * A request of a service to enroll. The service shows the user code; an admin
 * approves or denies the request that matches it.
 *
 * @class Serviceenrollment
 * @namespace Prometheus.Models
 * @extends DS.Model
 */
export default class ServiceenrollmentModel extends Model {

    /**
     * Name the service asks to enroll with
     *
     * @property name
     * @type String
     * @for Serviceenrollment
     * @public
     */
    @attr('string') name;

    /**
     * Kind of service: runtime or hermes
     *
     * @property kind
     * @type String
     * @for Serviceenrollment
     * @public
     */
    @attr('string') kind;

    /**
     * Status of the request: pending, approved, denied, expired or delivered
     *
     * @property status
     * @type String
     * @for Serviceenrollment
     * @public
     */
    @attr('string') status;

    /**
     * The code the service shows, to compare with the request
     *
     * @property userCode
     * @type String
     * @for Serviceenrollment
     * @public
     */
    @attr('string') userCode;

    /**
     * When the request expires (UTC)
     *
     * @property expiresAt
     * @type String
     * @for Serviceenrollment
     * @public
     */
    @attr('string') expiresAt;

    /**
     * Whether the request waits for an admin and has not run out of time
     *
     * @property isPending
     * @type Boolean
     * @for Serviceenrollment
     * @public
     */
    get isPending() {
        return this.status === 'pending';
    }
}
