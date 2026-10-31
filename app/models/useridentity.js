/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Model, { attr, belongsTo } from '@ember-data/model';

/**
 * An external identity (git, GitHub, GitLab, Slack, SSH...) of a user or agent.
 * Public data only: tokens and private keys are never stored.
 *
 * @class Useridentity
 * @namespace Prometheus.Models
 * @extends DS.Model
 */
export default class UseridentityModel extends Model {
	/**
	 * The user (human or agent) this identity belongs to.
	 *
	 * @property userId
	 * @type String
	 * @for Useridentity
	 * @private
	 */
	@attr('string') userId;

	/**
	 * The provider, e.g. git, github, gitlab, slack, ssh.
	 *
	 * @property provider
	 * @type String
	 * @for Useridentity
	 * @private
	 */
	@attr('string') provider;

	/**
	 * The handle on the provider.
	 *
	 * @property handle
	 * @type String
	 * @for Useridentity
	 * @private
	 */
	@attr('string') handle;

	/**
	 * The email used with the provider.
	 *
	 * @property email
	 * @type String
	 * @for Useridentity
	 * @private
	 */
	@attr('string') email;

	/**
	 * Fingerprint of the public key (never the key itself).
	 *
	 * @property publicKeyFingerprint
	 * @type String
	 * @for Useridentity
	 * @private
	 */
	@attr('string') publicKeyFingerprint;

	/**
	 * Whether the identity has been verified (read-only in the UI).
	 *
	 * @property verified
	 * @type Boolean
	 * @for Useridentity
	 * @private
	 */
	@attr('boolean', { defaultValue: false }) verified;

	/**
	 * Date the record was created.
	 *
	 * @property dateCreated
	 * @type String
	 * @for Useridentity
	 * @private
	 */
	@attr('string') dateCreated;

	/**
	 * Date the record was last modified.
	 *
	 * @property dateModified
	 * @type String
	 * @for Useridentity
	 * @private
	 */
	@attr('string') dateModified;

	/**
	 * The user this identity belongs to.
	 *
	 * @property user
	 * @type {Prometheus.Models.User}
	 * @for Useridentity
	 * @private
	 */
	@belongsTo('user') user;
}
