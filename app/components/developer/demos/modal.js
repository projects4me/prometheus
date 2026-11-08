import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import config from 'prometheus/config/environment';

/**
 * Component Library demo of bootstrap-modal: title, container class, confirm
 * behaviour and where the modal is rendered.
 *
 * @class DeveloperDemosModal
 * @namespace Prometheus.Components
 * @extends Component
 */
export default class DeveloperDemosModalComponent extends Component {
	titles = ['views.app.idea.screen.preview', 'global.form.save'];
	containerClasses = ['', 'idea-screen-modal'];
	confirmButtons = ['shown', 'removed'];
	behaviours = ['async', 'reject', 'sync'];
	renderings = ['inside the box', 'in-element'];

	@tracked isOpen = false;
	@tracked title = 'views.app.idea.screen.preview';
	@tracked containerClass = '';
	@tracked removeConfirmBtn = false;
	@tracked behaviour = 'async';
	@tracked inElement = false;

	/**
	 * The app root, outside the constrained box, so no parent style reaches the modal.
	 */
	get modalRoot() {
		return document.querySelector(config.APP.rootElement || 'body');
	}

	@action
	open(log) {
		log.log('open');
		this.isOpen = true;
	}

	@action
	setField(field, value) {
		this[field] = value;
	}

	get confirmButton() {
		return this.removeConfirmBtn ? 'removed' : 'shown';
	}

	get rendering() {
		return this.inElement ? 'in-element' : 'inside the box';
	}

	@action
	setConfirmButton(value) {
		this.removeConfirmBtn = value === 'removed';
	}

	@action
	setRendering(value) {
		this.inElement = value === 'in-element';
	}

	@action
	confirm(log) {
		const behaviour = this.behaviour;
		if (behaviour === 'sync') {
			log.log('confirm', { behaviour, result: true });
			return true;
		}
		return new Promise((resolve, reject) => {
			setTimeout(() => {
				if (behaviour === 'reject') {
					log.log('confirm', { behaviour, result: 'rejected' });
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
		log.log('hide');
		this.isOpen = false;
	}

	@action
	reset() {
		this.isOpen = false;
		this.title = 'views.app.idea.screen.preview';
		this.containerClass = '';
		this.removeConfirmBtn = false;
		this.behaviour = 'async';
		this.inElement = false;
	}
}
