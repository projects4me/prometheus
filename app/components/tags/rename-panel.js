/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task, timeout } from 'ember-concurrency';
import { isDestroying, isDestroyed } from '@ember/destroyable';

const CHECK_DELAY = 300;

/**
 * Renames, merges or deletes one tag for the whole project, inside Tags::EditModal. The changes apply at once (they
 * affect other records too), independent of the modal's staged changes. A name that another project tag already has
 * turns the rename into a merge into that tag. Failures show a translated error and keep the panel open.
 *
 * @class TagsRenamePanelComponent
 * @namespace Prometheus.Components
 * @extends Glimmer.Component
 *
 * @example
 * <Tags::RenamePanel @tag={{tag}} @projectId="p1" @onRenamed={{this.renamed}} @onMerged={{this.merged}}
 *   @onDeleted={{this.deleted}} @onCancel={{this.close}} />
 */
export default class TagsRenamePanelComponent extends Component {
	@service tags;
	@service acl;
	@service intl;

	/** What the user typed; null until then, when the input shows the tag's own name. */
	@tracked typedName = null;
	/** The other project tag with the typed name, when there is one. */
	@tracked target = null;
	@tracked usage = null;
	@tracked busy = false;
	@tracked confirmingDelete = false;
	@tracked error = '';

	get canUpdate() {
		return this.acl.checkAccess('tag.update');
	}

	get canDelete() {
		return this.acl.checkAccess('tag.delete');
	}

	/** The name in the input. */
	get name() {
		return this.typedName ?? this.args.tag.tag;
	}

	get trimmed() {
		return String(this.name ?? '').trim();
	}

	/** Whether the typed name differs from the tag's name, ignoring surrounding spaces. */
	get changed() {
		return this.trimmed !== '' && this.trimmed !== String(this.args.tag.tag).trim();
	}

	/** Rename and merge need tag.update; the button is off when nothing changed. */
	get canConfirm() {
		return this.canUpdate && this.changed && !this.busy && !this.check.isRunning;
	}

	@action
	setup(element) {
		element.querySelector('input')?.focus();
		this.loadUsage();
	}

	async loadUsage() {
		try {
			let usage = await this.tags.usage(this.args.tag);
			if (!this._gone && usage.issues !== null && usage.threads !== null) {
				this.usage = usage;
			}
		} catch {
			// The line is left out when the counts cannot be loaded
		}
	}

	@action
	typed(event) {
		this.typedName = event.target.value;
		this.target = null;
		this.error = '';
		this.check.perform(this.trimmed);
	}

	/** Looks for another project tag with the typed name once the user paused; a newer keystroke cancels it. */
	check = task({ restartable: true }, async (text) => {
		await timeout(CHECK_DELAY);
		let target = null;
		try {
			target = await this.tags.findOther(this.args.projectId, text, this.args.tag);
		} catch {
			// No match known: the confirm button stays a rename and Gaia refuses a duplicate
		}
		if (!this._gone && text === this.trimmed) {
			this.target = target;
		}
	});

	/** Renames the tag, or merges it into the existing tag with that name. */
	@action
	async confirm() {
		let { tag } = this.args;
		let target = this.target;
		await this.run(async () => {
			if (target) {
				await this.tags.merge(tag, target);
				this.args.onMerged?.(tag, target);
			} else {
				await this.tags.rename(tag, this.trimmed);
				this.args.onRenamed?.(tag);
			}
		}, target ? 'mergeFailed' : 'renameFailed');
	}

	@action
	askDelete() {
		this.confirmingDelete = true;
	}

	@action
	cancelDelete() {
		this.confirmingDelete = false;
	}

	@action
	async confirmDelete() {
		let { tag } = this.args;
		await this.run(async () => {
			await this.tags.remove(tag);
			this.args.onDeleted?.(tag);
		}, 'deleteFailed');
	}

	async run(work, failure) {
		if (this.busy) {
			return;
		}
		this.busy = true;
		this.error = '';
		try {
			await work();
		} catch {
			if (!this._gone) {
				this.error = this.intl.t(`components.tags.renamePanel.${failure}`);
			}
		} finally {
			if (!this._gone) {
				this.busy = false;
			}
		}
	}

	get _gone() {
		return isDestroying(this) || isDestroyed(this);
	}
}
