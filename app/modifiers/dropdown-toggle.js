/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Modifier from 'ember-modifier';
import { registerDestructor } from '@ember/destroyable';

const OPEN_CLASS = 'open';
const PARENT_SELECTOR = '.dropdown, .btn-group, li';

/**
 * The toggles that are open now, so that opening one closes the others.
 */
const openToggles = new Set();

/**
 * Opens and closes a Bootstrap-styled dropdown menu from its toggle element. It takes over the
 * behaviour of Bootstrap's dropdown toggling: a click toggles the open class on the closest
 * .dropdown, .btn-group or li parent and sets aria-expanded. The menu closes on a click anywhere else,
 * on Escape and when another dropdown opens. Enter and Space work on toggles that are not buttons.
 *
 * @example
 *      <a href="#" class="dropdown-toggle" {{dropdown-toggle}}>
 *
 * @class DropdownToggleModifier
 * @namespace Prometheus.Modifiers
 */
export default class DropdownToggleModifier extends Modifier {
	element = null;
	_registered = false;

	constructor(owner, args) {
		super(owner, args);
		registerDestructor(this, () => this._teardown());
	}

	modify(element) {
		if (this._registered) {
			return;
		}
		this.element = element;
		this._registered = true;
		element.addEventListener('click', this._onToggleClick);
		element.addEventListener('keydown', this._onKeydown);
	}

	get parent() {
		return this.element ? this.element.closest(PARENT_SELECTOR) : null;
	}

	get isOpen() {
		return openToggles.has(this);
	}

	open() {
		const parent = this.parent;
		if (!parent) {
			return;
		}
		[...openToggles].forEach((other) => other.close());
		parent.classList.add(OPEN_CLASS);
		this.element.setAttribute('aria-expanded', 'true');
		openToggles.add(this);
		document.addEventListener('click', this._onDocumentClick);
		document.addEventListener('keydown', this._onDocumentKeydown);
	}

	close() {
		if (!this.isOpen) {
			return;
		}
		openToggles.delete(this);
		document.removeEventListener('click', this._onDocumentClick);
		document.removeEventListener('keydown', this._onDocumentKeydown);
		const parent = this.parent;
		if (parent) {
			parent.classList.remove(OPEN_CLASS);
		}
		if (this.element) {
			this.element.setAttribute('aria-expanded', 'false');
		}
	}

	toggle() {
		if (this.isOpen) {
			this.close();
		} else {
			this.open();
		}
	}

	_onToggleClick = (event) => {
		if (this.element.matches(':disabled, .disabled')) {
			return;
		}
		if (this.element.tagName === 'A') {
			event.preventDefault();
		}
		this.toggle();
	};

	_onKeydown = (event) => {
		const isButton = this.element.tagName === 'BUTTON';
		if (!isButton && (event.key === 'Enter' || event.key === ' ')) {
			event.preventDefault();
			this.toggle();
		}
	};

	_onDocumentClick = (event) => {
		if (!this.element.contains(event.target)) {
			this.close();
		}
	};

	_onDocumentKeydown = (event) => {
		if (event.key === 'Escape') {
			this.close();
			this.element.focus();
		}
	};

	_teardown() {
		this.close();
		if (this.element) {
			this.element.removeEventListener('click', this._onToggleClick);
			this.element.removeEventListener('keydown', this._onKeydown);
		}
		this._registered = false;
	}
}
