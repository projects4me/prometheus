/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@ember/component';

/**
 * This component is used to manage the relate field template, as we might
 * need to show different type or style of information for different relate
 * fields.
 *
 * This is is the simple template just displaying the label
 *
 * @class RelateSimple
 * @namespace Prometheus.Components
 * @extends Ember.Component
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default Component.extend({
    /**
     * This is the tag name of this component
     *
     * @property tagName
     * @type String
     * @for RelateSimple
     * @private
     */
    tagName: 'span'

});