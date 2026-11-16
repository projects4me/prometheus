/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

/**
 * Component Library demo of AppUi::Modal: title, container class, confirm behaviour, a select
 * rendered in place, a Messenger error over the modal and a nested modal.
 *
 * @class DeveloperDemosModal
 * @namespace Prometheus.Components
 * @extends Component
 */
export default class DeveloperDemosModalComponent extends Component {
	titles = ['views.app.idea.screen.preview', 'global.form.save'];
	containerClasses = ['', 'idea-screen-modal'];
	confirmButtons = ['shown', 'removed'];
	behaviours = ['async', 'reject', 'falsy', 'sync'];
	nestedStates = ['off', 'on'];
	tagOptions = ['backend', 'frontend', 'design', 'testing'];

	@tracked isOpen = false;
	@tracked isNestedOpen = false;
	@tracked title = 'views.app.idea.screen.preview';
	@tracked containerClass = '';
	@tracked removeConfirmBtn = false;
	@tracked behaviour = 'async';
	@tracked nested = false;
	@tracked tags = [];

	get confirmButton() {
		return this.removeConfirmBtn ? 'removed' : 'shown';
	}

	get nestedState() {
		return this.nested ? 'on' : 'off';
	}

	@action
	open(log) {
		log.log('open');
		this.isOpen = true;
	}

	@action
	openNested(log) {
		log.log('open nested');
		this.isNestedOpen = true;
	}

	@action
	setField(field, value) {
		this[field] = value;
	}

	@action
	setConfirmButton(value) {
		this.removeConfirmBtn = value === 'removed';
	}

	@action
	setNested(value) {
		this.nested = value === 'on';
	}

	@action
	setTags(tags) {
		this.tags = tags;
	}

	/**
	 * Confirm as the chosen behaviour; a rejected save posts a Messenger error, which shows
	 * above the open modal.
	 */
	@action
	confirm(log) {
		const behaviour = this.behaviour;
		if (behaviour === 'sync') {
			log.log('confirm', { behaviour, result: true });
			return true;
		}
		if (behaviour === 'falsy') {
			log.log('confirm', { behaviour, result: false });
			return false;
		}
		return new Promise((resolve, reject) => {
			setTimeout(() => {
				if (behaviour === 'reject') {
					log.log('confirm', { behaviour, result: 'rejected' });
					window.Messenger?.().post({ message: 'The save failed; the modal stays open.', type: 'error', showCloseButton: true });
					reject(new Error('rejected'));
				} else {
					log.log('confirm', { behaviour, result: true });
					resolve(true);
				}
			}, 1000);
		});
	}

	@action
	closed(log) {
		log.log('close');
		this.isOpen = false;
		this.isNestedOpen = false;
	}

	@action
	closedNested(log) {
		log.log('close nested');
		this.isNestedOpen = false;
	}

	@action
	reset() {
		this.isOpen = false;
		this.isNestedOpen = false;
		this.title = 'views.app.idea.screen.preview';
		this.containerClass = '';
		this.removeConfirmBtn = false;
		this.behaviour = 'async';
		this.nested = false;
		this.tags = [];
	}
}
