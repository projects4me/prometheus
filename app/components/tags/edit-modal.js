/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { isDestroying, isDestroyed } from '@ember/destroyable';

const INPUT = '.ember-power-select-trigger-multiple-input, .ember-power-select-search-input';

/**
 * Edits the tags of one record (an issue or a thread) in a modal. The changes are staged: removing a chip or adding
 * a tag only changes the list in the modal, Save applies them through the TagsService (attach for added tags, detach
 * for removed ones), Cancel, the close button and Esc discard them. The cursor is in the input as soon as the modal
 * opens, and it stays there after a tag is added. When some changes fail the modal stays open with the error and the
 * record's actual tags reloaded.
 *
 * @class TagsEditModalComponent
 * @namespace Prometheus.Components
 * @extends Glimmer.Component
 *
 * @example
 * <Tags::EditModal @projectId={{this.projectId}} @relatedTo="issue" @relatedId={{this.issue.id}}
 *   @title="views.app.issue.detail.tags.modalTitle" @titleParams={{hash number=4980}}
 *   @onClose={{this.closeTags}} @onSaved={{this.reloadTags}} />
 */
export default class TagsEditModalComponent extends Component {
	@service tags;
	@service acl;
	@service intl;

	noSelection = [];

	/** The tagged records the record has, each with its tag loaded. */
	@tracked current = [];
	/** The tagged records staged for removal. */
	@tracked removed = [];
	/** The tag names staged for adding. */
	@tracked added = [];
	@tracked loading = true;
	@tracked error = '';
	/** The saved chip whose tag is being renamed, merged or deleted for the whole project (its panel is open). */
	@tracked renaming = null;
	/** The tag of the renaming chip. */
	@tracked renamingTag = null;
	/** Whether a project-wide change was made: the page's tags are refreshed when the modal closes. */
	changedProject = false;

	/** The translation key of the title: @title, else a plain "Tags". */
	get title() {
		return this.args.title ?? 'components.tags.editModal.title';
	}

	get canRemove() {
		return this.acl.checkAccess('tagged.delete');
	}

	/**
	 * The chips to show: the record's tags that are not staged for removal, then the staged additions.
	 *
	 * @property chips
	 * @type Array<{name: String, tagged: Tagged|undefined}>
	 */
	get chips() {
		let kept = this.current.filter((tagged) => !this.removed.includes(tagged)).map((tagged) => ({ name: nameOf(tagged), tagged }));
		return [...kept, ...this.added.map((name) => ({ name, tagged: undefined }))];
	}

	/** Whether the project-wide rename panel can be opened: it needs to update or delete tags. */
	get canManage() {
		return this.acl.checkAccess('tag.update') || this.acl.checkAccess('tag.delete');
	}

	/**
	 * Opens the rename panel for a saved chip, in place of the suggestion dropdown.
	 *
	 * @method openRename
	 * @param {{name: String, tagged: Tagged|undefined}} chip
	 */
	@action
	async openRename(chip) {
		let tag = await chip.tagged?.tag;
		if (tag && !this._gone) {
			this.renamingTag = tag;
			this.renaming = chip.tagged;
		}
	}

	@action
	closeRename() {
		this.renaming = null;
		this.renamingTag = null;
		this.focusInput();
	}

	/** The tag was renamed: its chip shows the new name already. */
	@action
	renamed() {
		this.changedProject = true;
		this.closeRename();
	}

	/** The tag was merged into another: its records now carry the target, so the record's tags are loaded again. */
	@action
	async merged() {
		this.changedProject = true;
		await this.dropRenaming(true);
	}

	/** The tag was deleted everywhere: its chip is gone. */
	@action
	async deleted() {
		this.changedProject = true;
		await this.dropRenaming(false);
	}

	/**
	 * Takes the changed tag's chip out of the staged lists at once, closes the panel and, after a merge, reloads the
	 * record's tags while keeping the staged changes that still apply.
	 */
	async dropRenaming(reload) {
		let gone = this.renaming;
		let removedIds = this.removed.map((tagged) => tagged.id);
		let added = this.added;
		this.current = this.current.filter((tagged) => tagged !== gone);
		this.removed = this.removed.filter((tagged) => tagged !== gone);
		this.closeRename();
		if (reload) {
			await this.load();
			if (!this._gone) {
				this.removed = this.current.filter((tagged) => removedIds.includes(tagged.id));
				let used = this.chips.map((chip) => chip.name.toLowerCase());
				this.added = added.filter((name) => !used.includes(name.toLowerCase()));
			}
		}
	}

	/** Closes the modal; tells `@onSaved` first when a project-wide change was made, so the page's chips refresh. */
	@action
	close() {
		if (this.changedProject) {
			this.args.onSaved?.();
		}
		this.args.onClose?.();
	}

	/** Loads the record's tags and puts the cursor in the input once the modal is on the page. */
	@action
	setup(element) {
		this.element = element;
		this.focusInput();
		return this.load();
	}

	async load() {
		this.loading = true;
		try {
			let list = await this.tags.forRecord(this.args.relatedTo, this.args.relatedId);
			if (!this._gone) {
				this.current = list;
				this.removed = [];
				this.added = [];
			}
		} catch {
			if (!this._gone) {
				this.error = this.intl.t('components.tags.editModal.loadFailed');
			}
		} finally {
			if (!this._gone) {
				this.loading = false;
			}
		}
	}

	/**
	 * The project's tags that contain the text, without the ones the record has (as staged), as select options.
	 *
	 * @method search
	 * @param {String} text
	 * @return {Promise<Array<{label: String, value: String}>>}
	 */
	@action
	async search(text) {
		let request = (this._searchId = (this._searchId ?? 0) + 1);
		let found;
		try {
			found = await this.tags.suggest(this.args.projectId, text);
		} catch {
			return [];
		}
		if (request !== this._searchId) {
			return [];
		}
		let used = this.chips.map((chip) => chip.name.toLowerCase());
		return found.filter((tag) => !used.includes(String(tag.tag).trim().toLowerCase())).map((tag) => ({ label: tag.tag, value: tag.id }));
	}

	/**
	 * Stages a tag for adding. A tag the record already shows is ignored; one staged for removal is kept instead.
	 *
	 * @method add
	 * @param {String} text
	 */
	@action
	add(text) {
		let name = String(text ?? '').trim();
		let key = name.toLowerCase();
		if (name && !this.chips.some((chip) => chip.name.toLowerCase() === key)) {
			let unremoved = this.removed.find((tagged) => nameOf(tagged).toLowerCase() === key);
			if (unremoved) {
				this.removed = this.removed.filter((tagged) => tagged !== unremoved);
			} else {
				this.added = [...this.added, name];
			}
		}
		this.focusInput();
	}

	@action
	addPicked(selected) {
		for (let option of Array.from(selected ?? [])) {
			this.add(option.label);
		}
	}

	/**
	 * Stages the removal of a chip: a staged addition is dropped, a saved tag is detached on Save.
	 *
	 * @method remove
	 * @param {{name: String, tagged: Tagged|undefined}} chip
	 */
	@action
	remove(chip) {
		if (chip.tagged) {
			this.removed = [...this.removed, chip.tagged];
		} else {
			this.added = this.added.filter((name) => name !== chip.name);
		}
		this.focusInput();
	}

	/**
	 * Applies the staged changes. Resolves true (the modal closes) when all went through, after telling `@onSaved`.
	 * Otherwise resolves false, shows the error and reloads the record's actual tags.
	 *
	 * @method save
	 * @return {Promise<Boolean>}
	 */
	@action
	async save() {
		let { projectId, relatedTo, relatedId } = this.args;
		let failed = 0;
		this.error = '';
		for (let tagged of this.removed) {
			try {
				await this.tags.detach(tagged);
			} catch {
				failed++;
			}
		}
		for (let name of this.added) {
			try {
				await this.tags.attach(projectId, relatedTo, relatedId, name);
			} catch {
				failed++;
			}
		}
		if (failed === 0) {
			this.changedProject = false;
			this.args.onSaved?.();
			return true;
		}
		if (this._gone) {
			return false;
		}
		this.error = this.intl.t('components.tags.editModal.failed', { count: failed });
		await this.load();
		return false;
	}

	/** Puts the cursor in the input, now and once the dropdown has rendered. */
	focusInput() {
		let focus = () => {
			if (!this._gone) {
				this.element?.querySelector(INPUT)?.focus();
			}
		};
		focus();
		requestAnimationFrame(focus);
	}

	get _gone() {
		return isDestroying(this) || isDestroyed(this);
	}
}

/**
 * The tag text of a tagged record.
 *
 * @param {Tagged} tagged
 * @return {String}
 */
function nameOf(tagged) {
	return String(tagged.tag?.get?.('tag') ?? tagged.tag?.tag ?? '').trim();
}
