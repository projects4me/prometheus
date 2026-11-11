/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { postToast } from 'prometheus/utils/ui/post-toast';

import { objectAt } from 'prometheus/utils/array/object-at';
/**
 * The Credentials box of an agent's detail page: shows the agent's client credential and issues, rotates and
 * revokes it. The secret of a new credential is shown once, in a modal.
 *
 * @class AgentCredentialsComponent
 * @namespace Prometheus.Components.Agent
 * @extends Glimmer.Component
 */
export default class AgentCredentialsComponent extends Component {
	/**
	 * @property store
	 * @type Ember.Service
	 */
	@service store;

	/**
	 * @property intl
	 * @type Ember.Service
	 */
	@service intl;

	/**
	 * The agent's live credential, if it has one.
	 *
	 * @property credential
	 * @type Prometheus.Models.Agentcredential|null
	 */
	@tracked credential = null;

	/**
	 * Whether the credential was loaded.
	 *
	 * @property loaded
	 * @type Boolean
	 */
	@tracked loaded = false;

	/**
	 * The new secret while its modal is open, `null` otherwise. It is not kept anywhere else.
	 *
	 * @property issued
	 * @type {Object|null} `clientId` and `clientSecret`
	 */
	@tracked issued = null;

	/**
	 * Whether the revoke confirmation is open.
	 *
	 * @property confirmingRevoke
	 * @type Boolean
	 */
	@tracked confirmingRevoke = false;

	/**
	 * The `gaia-mcp.env` lines of the issued secret.
	 *
	 * @property envLines
	 * @type String
	 */
	get envLines() {
		return `GAIA_CLIENT_ID=${this.issued.clientId}\nGAIA_CLIENT_SECRET=${this.issued.clientSecret}`;
	}

	/**
	 * Loads the credential of the agent.
	 *
	 * @method load
	 */
	@action async load() {
		try {
			let credentials = await this.store.query('agentcredential', {
				query: `(Agentcredential.agentId : ${this.args.agent.id})`
			});
			if (this.isDestroying || this.isDestroyed) {
				return;
			}
			this.credential = credentials.length ? objectAt(credentials, 0) : null;
			this.loaded = true;
		} catch (error) {
			// stays unloaded, so Issue is not offered over a credential we could not read
			postToast(this.intl, 'views.app.agent.credentials.loadFailed', 'error');
		}
	}

	/**
	 * Issues a secret, which replaces the previous one, and opens the modal that shows it.
	 *
	 * @method issue
	 */
	@action async issue() {
		let record = this.store.createRecord('agentcredential', { agentId: this.args.agent.id });
		try {
			await record.save();
			if (this.isDestroying || this.isDestroyed) {
				return;
			}
			this.issued = { clientId: record.clientId, clientSecret: record.clientSecret };
			record.clientSecret = null;
			if (this.credential && this.credential !== record) {
				this.credential.unloadRecord();
			}
			this.credential = record;
		} catch (error) {
			record.unloadRecord();
			postToast(this.intl, 'views.app.agent.credentials.issueFailed', 'error');
		}
	}

	/**
	 * Forgets the secret once the modal is closed.
	 *
	 * @method closeIssued
	 */
	@action closeIssued() {
		this.issued = null;
	}

	/**
	 * @method askRevoke
	 */
	@action askRevoke() {
		this.confirmingRevoke = true;
	}

	/**
	 * @method closeRevoke
	 */
	@action closeRevoke() {
		this.confirmingRevoke = false;
	}

	/**
	 * Revokes the credential.
	 *
	 * @method revoke
	 * @return {Promise<Boolean>} whether it was revoked, which closes the confirmation
	 */
	@action async revoke() {
		try {
			await this.credential.destroyRecord();
			if (!this.isDestroying && !this.isDestroyed) {
				this.credential = null;
				this.confirmingRevoke = false;
			}
			postToast(this.intl, 'views.app.agent.credentials.revoked');
			return true;
		} catch (error) {
			this.credential?.rollbackAttributes();
			postToast(this.intl, 'views.app.agent.credentials.revokeFailed', 'error');
			return false;
		}
	}

	/**
	 * Copies text to the clipboard.
	 *
	 * @method copy
	 * @param {String} text the text to copy
	 */
	@action async copy(text) {
		try {
			await navigator.clipboard.writeText(text);
			postToast(this.intl, 'views.app.agent.credentials.copied');
		} catch (error) {
			postToast(this.intl, 'views.app.agent.credentials.copyFailed', 'error');
		}
	}
}
