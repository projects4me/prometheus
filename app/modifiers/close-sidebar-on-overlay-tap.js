/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { modifier } from 'ember-modifier';

/**
 * Closes the phone sidebar when the page next to it is tapped. On phones the open sidebar dims the
 * page with an overlay drawn on the element (sidebar-overlay.scss), so a tap anywhere on it closes the
 * sidebar. Without an open phone sidebar the tap does nothing.
 *
 * Usage: `<div class="content-wrapper" {{close-sidebar-on-overlay-tap this.sidebar}}>` with the sidebar service.
 *
 * @namespace Prometheus.Modifiers
 */
export default modifier(function closeSidebarOnOverlayTap(element, [sidebar]) {
    element.addEventListener('click', sidebar.close);

    return () => {
        element.removeEventListener('click', sidebar.close);
    };
});
