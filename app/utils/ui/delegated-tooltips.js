/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

/**
 * The selector of the elements that get a tooltip.
 */
export const TOOLTIP_SELECTOR = '[data-toggle="tooltip"]';

const GAP = 5;

/**
 * Reads the tooltip text of an element from its title attribute. The title is
 * moved to data-original-title so the browser does not show its own tooltip too.
 *
 * @method tooltipContent
 * @param {Element} element
 * @return {String}
 */
function tooltipContent(element) {
    const title = element.getAttribute('title');
    if (title) {
        element.setAttribute('data-original-title', title);
        element.removeAttribute('title');
    }
    return element.getAttribute('data-original-title') || '';
}

/**
 * Registers one delegated tooltip handler on the given root, so that elements
 * rendered later also get their tooltip. It uses neither jQuery nor a library:
 * the popup is built with the Bootstrap 3 tooltip markup, so the look is the same.
 *
 * @method registerDelegatedTooltips
 * @param {Element} root
 * @return {Function} removes the handlers
 */
export function registerDelegatedTooltips(root = document.body) {
    let tip = null;

    const hide = () => {
        if (tip) {
            tip.remove();
            tip = null;
        }
    };

    const show = (event) => {
        const target = event.target.closest && event.target.closest(TOOLTIP_SELECTOR);
        if (!target || !root.contains(target)) {
            return;
        }
        const text = tooltipContent(target);
        hide();
        if (!text) {
            return;
        }
        tip = document.createElement('div');
        tip.className = 'tooltip top in';
        tip.setAttribute('role', 'tooltip');
        tip.innerHTML = '<div class="tooltip-arrow"></div><div class="tooltip-inner"></div>';
        tip.lastChild.textContent = text;
        document.body.appendChild(tip);

        const rect = target.getBoundingClientRect();
        const left = rect.left + window.pageXOffset + (rect.width - tip.offsetWidth) / 2;
        const top = rect.top + window.pageYOffset - tip.offsetHeight - GAP;
        tip.style.left = `${Math.max(left, 0)}px`;
        tip.style.top = `${Math.max(top, 0)}px`;
    };

    const leave = (event) => {
        const target = event.target.closest && event.target.closest(TOOLTIP_SELECTOR);
        if (target) {
            hide();
        }
    };

    root.addEventListener('mouseover', show);
    root.addEventListener('mouseout', leave);
    root.addEventListener('click', hide);

    return () => {
        hide();
        root.removeEventListener('mouseover', show);
        root.removeEventListener('mouseout', leave);
        root.removeEventListener('click', hide);
    };
}
