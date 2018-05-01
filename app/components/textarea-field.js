/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import TextArea from '@ember/component/text-area';

/**
 * This object is used to modify the default TextFeild of emberjs in order to
 * allow run time binding of fields based on metadata. By default emberjs
 * does not allow valueBinding with dynamic field names.
 * This code is a slightly modifed version of code implemented by Jason Porritt
 * which can be found here
 *
 * https://gist.github.com/jasonporritt/5473506#file-dynamic_bound_text_field-coffee
 * Thank you Jason for sharing :), I have been at this problem for some time now.
 *
 * @class TextareaField
 * @namespace Prometheus.Components
 * @extends Ember.TextArea
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default TextArea.extend({

    /**
     * Adding paramater binding for data-identifier so that we can get the related id with it
     *
     * @property attributeBindings
     * @type Array
     * @for TextareaField
     * @private
     */
    attributeBindings: ['data-related','data-identifier'],

    /**
     * These are the class names that are applied to this component
     *
     * @property classNames
     * @type Array
     * @for TextareaField
     * @private
     */
    classNames: ['form-control','data-input'],

});