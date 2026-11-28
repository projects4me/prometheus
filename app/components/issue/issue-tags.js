/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { isDestroying, isDestroyed } from '@ember/destroyable';

/**
 * The tags of an issue on its detail page: the tags as chips linking to the issue list filtered by the tag, and a
 * button that opens Tags::EditModal to change them (shown with `tagged.create` or `tagged.delete`). The modal does the
 * attaching and detaching; the chips reload when it saves.
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

	/** The tagged records of the issue, each with its tag loaded. */
	@tracked taggedList = [];
	@tracked loadFailed = false;
	/** Whether the tags modal is open. */
	@tracked editing = false;

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
	 * Whether the user may change tags: they can add or remove them.
	 *
	 * @property canEdit
	 * @type Boolean
	 */
	get canEdit() {
		return this.acl.checkAccess('tagged.create') || this.acl.checkAccess('tagged.delete');
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

	/** Opens the tags modal. */
	@action
	openEdit() {
		this.editing = true;
	}

	/** Closes the tags modal. */
	@action
	closeEdit() {
		if (!this._gone) {
			this.editing = false;
		}
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

	get _gone() {
		return isDestroying(this) || isDestroyed(this);
	}
}
