/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */
import Component from '@ember/component';
import { computed } from '@ember/object';

/**
 * This component is is used to render the priority icon
 *
 * @class PriorityIcon
 * @namespace Prometheus.Components
 * @extends Ember.Component
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default Component.extend({

    /**
     * This is the taf used for this component
     *
     * @property tagName
     * @type String
     * @for PriorityIcon
     * @private
     */
    tagName: 'i',

    /**
     * The list of properties to be be used to set the class names
     *
     * @property classNameBindings
     * @type Array
     * @for PriorityIcon
     * @private
     */
    classNameBindings: ['getClassNames'],

    /**
     * The list classes for this object
     *
     * @property classNames
     * @type Array
     * @for PriorityIcon
     * @private
     */
    classNames: ['fa'],


    /**
     * These are the class names to be associated with this component
     *
     * @property getClassNames
     * @type Array
     * @for PriorityIcon
     * @private
     */
    getClassNames: computed('priority', function() {
        let priority =this.get('priority');
        let className = '';

        switch (priority) {
            case 'blocker':
                className = 'fa-ban';
                break;
            case 'critical':
                className = 'fa-angle-double-up';
                break;
            case 'high':
                className = 'fa-arrow-up';
                break;
            case 'medium':
                className = 'fa-dot-circle-o';
                break;
            case 'low':
                className = 'fa-arrow-down';
                break;
            case 'lowest':
                className = 'fa-angle-double-down';
                break;
            default:
                break;
        }

        return className;
    }).volatile()

});
