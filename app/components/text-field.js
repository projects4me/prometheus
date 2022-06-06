/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { TextField } from '@ember/legacy-built-in-components';

/**
 * This object is used to modify the default TextField of EmberJS in order to
 * allow run time binding of fields based on metadata. By default EmberJS
 * does not allow valueBinding with dynamic field names.
 *
 * This code is a slightly modified version of code implemented by Jason Porritt
 * which can be found here
 * https://gist.github.com/jasonporritt/5473506#file-dynamic_bound_text_field-coffee
 * Thank you Jason for sharing :), I have been at this problem for some time now.
 *
 * @class TextField
 * @namespace Prometheus.Component
 * @extends Ember.TextField
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default TextField.extend({

    /**
     * These are the classes that must be added in the HTML tag
     *
     * @property classNames
     * @type Array
     * @for TextField
     * @private
     */
    classNames: ['form-control', 'input-sm', 'data-input'],

    /**
     * We are allowing certain attributes across the board
     *
     * @property attributeBindings
     * @type Array
     * @for TextField
     * @private
     */
    attributeBindings: ['data-input']

});