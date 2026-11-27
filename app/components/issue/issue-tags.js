/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { isDestroying, isDestroyed } from '@ember/destroyable';

/**
 * The tags of an issue on its detail page: the tags as chips, each with a remove button, and a select to add a tag
 * (an existing tag of the project, or free text as a new one). The TagsService does the loading, attaching and
 * detaching; without the `tagged.create` permission the chips are read only and the select is hidden.
 *
 * @class IssueIssueTagsComponent
 * @namespace Prometheus.Components
 * @extends Glimmer.Component
 *
 * @example
 * <Issue::IssueTags @issue={{this.issue}} />
 */
export default class IssueIssueTagsComponent extends Component {
	@service tags;
	@service acl;
	@service trackedProject;
	@service intl;

	/** The tagged records of the issue, each with its tag loaded. */
	@tracked taggedList = [];
	@tracked loadFailed = false;
	/** Whether the add select is open under the chips. */
	@tracked adding = false;

	/**
	 * The project of the issue: its own projectId, else the project selected in the app.
	 *
	 * @property projectId
	 * @type String
	 */
	get projectId() {
		return this.args.issue.projectId ?? this.trackedProject.id;
	}

	/**
	 * Whether the user may add and remove tags.
	 *
	 * @property canEdit
	 * @type Boolean
	 */
	get canEdit() {
		return this.acl.checkAccess('tagged.create');
	}

	/**
	 * The shortcode (lower case) of the project of the issue, for the link to the list filtered by a tag.
	 *
	 * @property shortcode
	 * @type String
	 */
	get shortcode() {
		return String(this.args.issue.projectShortcode ?? this.trackedProject.shortCode ?? '').toLowerCase();
	}

	/** Opens the add select. */
	@action
	startAdding() {
		this.adding = true;
	}

	/**
	 * Closes the add select (Esc, a click away or after a tag was chosen). A click on a chip's remove button keeps it
	 * open, so the button is still there when the click completes.
	 *
	 * @method stopAdding
	 * @param {Object} [select] power-select's public API
	 * @param {Event} [event] what closed the select
	 */
	@action
	stopAdding(select, event) {
		if (event?.target?.closest?.('[data-app-ui-tag-remove]')) {
			return;
		}
		if (!this._gone) {
			this.adding = false;
		}
	}

	/** Whether the user may remove tags. */
	get canRemove() {
		return this.acl.checkAccess('tagged.delete');
	}

	/**
	 * Loads the tags of the issue.
	 *
	 * @method load
	 */
	@action
	async load() {
		this.loadFailed = false;
		try {
			let list = await this.tags.forRecord('issue', this.args.issue.id);
			if (!this._gone) {
				this.taggedList = list;
			}
		} catch (error) {
			console.error("The tags of the issue could not be loaded", error);
			if (!this._gone) {
				this.loadFailed = true;
			}
		}
	}

	/**
	 * The tags of the project that contain the text, as options of the select. Tags the issue already has are left out.
	 *
	 * @method search
	 * @param {String} text
	 * @return {Promise<Array>}
	 */
	@action
	async search(text) {
		let found = await this.tags.suggest(this.projectId, text);
		let used = this.taggedList.map((tagged) => String(tagged.tagId));
		return found.filter((tag) => !used.includes(String(tag.id))).map((tag) => ({ label: tag.tag, value: tag.id }));
	}

	/**
	 * Attaches an existing tag picked in the select.
	 *
	 * @method select
	 * @param {Array} selected the options chosen
	 */
	@action
	async select(selected) {
		for (let option of selected ?? []) {
			await this.add(option.label);
		}
	}

	/**
	 * Attaches the text as a tag: the project's tag of that name is reused, a missing one is created.
	 *
	 * @method add
	 * @param {String} text
	 */
	@action
	async add(text) {
		this.stopAdding();
		let exists = this.taggedList.some((tagged) => String(tagged.tag?.tag).trim().toLowerCase() === String(text).trim().toLowerCase());
		if (exists) {
			return;
		}
		try {
			let issue = this.args.issue;
			let tagged = await this.tags.attach(this.projectId, 'issue', issue.id, text);
			if (!this._gone) {
				this.taggedList = [...this.taggedList, tagged];
			}
		} catch {
			this.showError();
		}
	}

	/**
	 * Removes a tag from the issue.
	 *
	 * @method remove
	 * @param {Tagged} tagged
	 */
	@action
	async remove(tagged) {
		try {
			await this.tags.detach(tagged);
			if (!this._gone) {
				this.taggedList = this.taggedList.filter((item) => item !== tagged);
			}
		} catch {
			this.showError();
		}
	}

	/**
	 * Shows an error toast for a tag that could not be added or removed.
	 *
	 * @method showError
	 * @private
	 */
	showError() {
		new Messenger().post({
			message: this.intl.t('views.app.issue.detail.tags.failed'),
			type: 'error',
			showCloseButton: true
		});
	}

	get _gone() {
		return isDestroying(this) || isDestroyed(this);
	}
}
