/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { modifier } from 'ember-modifier';
import $ from 'jquery';

/**
 * This modifier will be called on the initialization of side bar component to attach slim scroll
 * to it and activate AdminLTE's sidebar push menu
 *
 * @namespace Prometheus.Modifiers
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default modifier(function initializeSidebar() {
    let o = $.AdminLTE.options;
    $.AdminLTE.tree('.sidebar');
    //Add slimscroll to navbar dropdown
    $(".navbar .menu").slimscroll({
        height: o.navbarMenuHeight,
        alwaysVisible: false,
        size: o.navbarMenuSlimscrollWidth
    }).css("width", "100%");

    //Activate sidebar push menu
    $.AdminLTE.pushMenu.activate(o.sidebarToggleSelector);
});
