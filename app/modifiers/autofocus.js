/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */
import Modifier from 'ember-modifier';

/**
 * This modifier will be called on the creation of any Form field on which user needs
 * autofocus functionality.
 *
 * @namespace Prometheus.Modifiers
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class AutofocusModifier extends Modifier {

    /**
     * This function is called when element is rendered in DOM.
     * 
     * @param {Element} element 
     * @param {Array} positionalArguments This contains arry of positional arguments. 
     * @param {Array} namedArguments This contains array of named arguments.
     */
    modify(element, [positionalArguments], { shouldFocus }) {
        let focus = shouldFocus;
        if (focus) { element.focus(); }
    }
}
