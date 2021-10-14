/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
*/

import Component from '@glimmer/component';
import { action } from '@ember/object';
import $ from'jquery';

/**
 * This component is application wrapper.
 *
 * @class ApplicationHeader
 * @namespace Prometheus.Components
 * @extends Ember.Component
 * @author Rana Nouman <ranamnouman@yahoo.com>
 */
export default class ApplicationWrapperComponent extends Component {
    @action activateAdminLTE(){
        $.AdminLTE.layout.activate();
        $.AdminLTE.boxWidget.activate();
    }
}

