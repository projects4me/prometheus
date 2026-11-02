/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Model, { attr } from '@ember-data/model';

/**
 * The login credential of an agent. Gaia keeps only a hash of the secret: `clientSecret` is in the response that
 * creates the credential and never again.
 *
 * @class Agentcredential
 * @namespace Prometheus.Models
 * @extends DS.Model
 */
export default class AgentcredentialModel extends Model {
	/**
	 * @property agentId
	 * @type String
	 */
	@attr('string') agentId;

	/**
	 * The client ID the agent signs in with.
	 *
	 * @property clientId
	 * @type String
	 */
	@attr('string') clientId;

	/**
	 * The secret, only in the response of the request that created the credential.
	 *
	 * @property clientSecret
	 * @type String
	 */
	@attr('string') clientSecret;

	/**
	 * @property lastUsedAt
	 * @type String
	 */
	@attr('string') lastUsedAt;

	/**
	 * @property createdUserName
	 * @type String
	 */
	@attr('string') createdUserName;

	/**
	 * @property dateCreated
	 * @type String
	 */
	@attr('string') dateCreated;
}
