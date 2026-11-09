/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Model, { attr } from '@ember-data/model';

/**
 * A single-use token that lets a deploy pipeline enroll a service without an
 * admin approving it. Gaia returns the token itself only when it is created.
 *
 * @class Serviceenrollmenttoken
 * @namespace Prometheus.Models
 * @extends DS.Model
 */
export default class ServiceenrollmenttokenModel extends Model {

    /**
     * Name the service enrolls with
     *
     * @property name
     * @type String
     * @for Serviceenrollmenttoken
     * @public
     */
    @attr('string') name;

    /**
     * Kind of service: runtime or hermes
     *
     * @property kind
     * @type String
     * @for Serviceenrollmenttoken
     * @public
     */
    @attr('string') kind;

    /**
     * When the token expires (UTC)
     *
     * @property expiresAt
     * @type String
     * @for Serviceenrollmenttoken
     * @public
     */
    @attr('string') expiresAt;

    /**
     * When the token was used, null while unused
     *
     * @property usedAt
     * @type String
     * @for Serviceenrollmenttoken
     * @public
     */
    @attr('string') usedAt;

    /**
     * The secret token, present only in the response that created it
     *
     * @property token
     * @type String
     * @for Serviceenrollmenttoken
     * @public
     */
    @attr('string') token;
}
