/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@ember/component';
import $ from 'jquery';

/**
 * This class adds the functionality of dropdown action menu in the system
 * In order to allow capturing of an event of any specified name we are passing
 * all incoming actions over to the controller.
 *
 * @class Widgets
 * @namespace Prometheus.Components.Widgets
 * @extends Ember.Component
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default Component.extend({

    /**
     * This function is used to initialize the sortable behavior
     *
     * @method didInsertElement
     * @for Widgets
     * @protected
     */
    didInsertElement(){

        $('.connectedSortable').sortable({
            placeholder         : 'sort-highlight',
            connectWith         : '.connectedSortable',
            handle              : '.box-header, .nav-tabs',
            forcePlaceholderSize: true,
            zIndex              : 999999
        });
        $('.connectedSortable .box-header, .connectedSortable .nav-tabs-custom').css('cursor', 'move');

    }
});
