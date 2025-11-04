import Modifier from 'ember-modifier';

/**
 * This modifier is used to modify the links in the element.
 * It will add target="_blank" and rel="noopener noreferrer" to external links.
 * It will remove target and rel from internal links.
 * 
 * @class ModifyLinksModifier
 * @extends Modifier
 * @namespace App.Modifiers
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class ModifyLinksModifier extends Modifier {
	/**
	 * This function is called when the element is rendered in the DOM.
	 * It modifies the links in the element.
	 * 
	 * @param {Element} element - The element to modify
	 */
	modify(element) {
		element.querySelectorAll('a').forEach((link) => {
			try {
				const url = new URL(link.href, window.location.origin);
				const isExternal = url.origin !== window.location.origin;

				if (isExternal) {
					link.target = '_blank';
					link.rel = 'noopener noreferrer';
				} else {
					link.removeAttribute('target');
					link.removeAttribute('rel');
				}
			} catch {}
		});
	}
}
