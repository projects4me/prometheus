/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Ember from "ember";
import FormField from "../components/form-fields";

/**
 * This component is used to manage the relate field template, as we might
 * need to show different type or style of information for different relate
 * fields.
 *
 * This is is the simple template just displaying the label
 *
 * @class RelateUser
 * @namespace Prometheus.Components
 * @extends Ember.Component
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default Ember.Component.extend({

    /**
     * This is the tag name of this component
     *
     * @property tagName
     * @type String
     * @for RelateUser
     * @private
     */
    tagName: 'span'
});