import { modifier } from 'ember-modifier';
import $ from 'jquery';

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
