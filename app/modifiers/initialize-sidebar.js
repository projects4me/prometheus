/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { modifier } from 'ember-modifier';
import $ from 'jquery';

const SIDEBAR_STORAGE_KEY = 'sidebar-collapsed';

/**
 * This modifier will be called on the initialization of side bar component to attach slim scroll
 * to it and activate AdminLTE's sidebar push menu. It also persists the sidebar collapsed/expanded
 * state to localStorage so the user's preference is restored across sessions.
 *
 * @namespace Prometheus.Modifiers
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default modifier(function initializeSidebar() {
    let o = $.AdminLTE.options;

    $.AdminLTE.tree = function (menu) {
        let animationSpeed = $.AdminLTE.options.animationSpeed;
        $(document).off('click', menu + ' li a')
            .on('click', menu + ' li a', function (e) {
                let $this = $(this);
                let checkElement = $this.next();

                // Collapsing a visible treeview-menu
                if (checkElement.is('.treeview-menu') && checkElement.is(':visible') && !$('body').hasClass('sidebar-collapse')) {
                    checkElement.parent('li').removeClass('menu-open');
                    checkElement.slideUp(animationSpeed, function () {
                        checkElement.removeClass('menu-open');
                    });
                // Expanding a hidden treeview-menu
                } else if (checkElement.is('.treeview-menu') && !checkElement.is(':visible')) {
                    let parentUl = $this.parents('ul').first();
                    parentUl.find('ul:visible').each(function () {
                        $(this).parent('li').removeClass('menu-open');
                    });
                    parentUl.find('ul:visible').slideUp(animationSpeed).removeClass('menu-open');

                    checkElement.parent('li').addClass('menu-open');
                    checkElement.slideDown(animationSpeed, function () {
                        checkElement.addClass('menu-open');
                    });
                }

                if (checkElement.is('.treeview-menu')) {
                    e.preventDefault();
                }
            });
    };

    $.AdminLTE.tree('.sidebar');

    $(".navbar .menu").slimscroll({
        height: o.navbarMenuHeight,
        alwaysVisible: false,
        size: o.navbarMenuSlimscrollWidth
    }).css("width", "100%");

    $.AdminLTE.pushMenu.activate(o.sidebarToggleSelector);

    if (localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true') {
        $('body').addClass('sidebar-collapse');
    }

    $('body').on('collapsed.pushMenu', function () {
        localStorage.setItem(SIDEBAR_STORAGE_KEY, 'true');
    });

    $('body').on('expanded.pushMenu', function () {
        localStorage.setItem(SIDEBAR_STORAGE_KEY, 'false');
    });

    return () => {
        $('body').off('collapsed.pushMenu');
        $('body').off('expanded.pushMenu');
    };
});
