/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { modifier } from 'ember-modifier';

const PHONE_MAX_WIDTH = 768;

/**
 * Closes the sidebar after every route change on phones (viewport below 768px). The desktop
 * expand/collapse state and the persisted sidebar-collapsed preference are never touched.
 *
 * Usage: `{{close-sidebar-on-navigate this.router}}` where the argument is the router service.
 *
 * @namespace Prometheus.Modifiers
 */
export default modifier(function closeSidebarOnNavigate(element, [router]) {
    const close = () => {
        if (window.innerWidth < PHONE_MAX_WIDTH) {
            document.body.classList.remove('sidebar-open');
        }
    };

    router.on('routeDidChange', close);

    return () => {
        router.off('routeDidChange', close);
    };
});
