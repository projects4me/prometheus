/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { modifier } from 'ember-modifier';

/**
 * Closes the phone sidebar after every route change. The desktop collapsed state and its persisted
 * preference are never touched.
 *
 * Usage: `{{close-sidebar-on-navigate this.router this.sidebar}}` with the router and sidebar services.
 *
 * @namespace Prometheus.Modifiers
 */
export default modifier(function closeSidebarOnNavigate(element, [router, sidebar]) {
    router.on('routeDidChange', sidebar.close);

    return () => {
        router.off('routeDidChange', sidebar.close);
    };
});
