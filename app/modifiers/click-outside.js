import Modifier from 'ember-modifier';
import { registerDestructor } from '@ember/destroyable';

/**
 * A modifier that triggers a handler when a click occurs outside the element.
 * This modifier will be called when user wants to handle click outside of any element.
 *
 * @namespace App.Modifiers
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class ClickOutsideModifier extends Modifier {
	/**
	 * The click handler function.
	 * @type {Function}
	 * @private
	 */
	_onClick = null;

	/**
	 * The handler function to be called on an outside click.
	 * @type {Function}
	 * @private
	 */
	_handler = null;

	/**
	 * Removes the click listener when the modifier is torn down.
	 *
	 * @method constructor
	 * @param {Object} owner
	 * @param {Object} args
	 */
	constructor(owner, args) {
		super(owner, args);
		registerDestructor(this, () => this._removeListener());
	}

	/**
	 * This function is called when the element is rendered in the DOM.
	 * It sets up the click event listener.
	 *
	 * @param {Element} element - The element the modifier is attached to.
	 * @param {Array} positional - The positional arguments passed to the modifier.
	 * @param {Object} named - The named arguments passed to the modifier.
	 */
	modify(element, positional, named) {
		if (!this._onClick) {
			this._handler = positional[0];
			const isDisabled = named.disabled;

			this._onClick = (event) => {
				if (element && !element.contains(event.target)) {
					this._handler(event);
				}
			};

			if (!isDisabled) {
				document.addEventListener('click', this._onClick, true);
			}
		} else {
			const isDisabled = named.disabled;

			document.removeEventListener('click', this._onClick, true);
			if (!isDisabled) {
				document.addEventListener('click', this._onClick, true);
			}
		}
	}

	/**
	 * Cleans up the click event listener.
	 *
	 * @method _removeListener
	 * @private
	 */
	_removeListener() {
		if (this._onClick) {
			document.removeEventListener('click', this._onClick, true);
		}
	}
}
