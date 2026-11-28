/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { service } from '@ember/service';
import { modifier } from 'ember-modifier';

/**
 * The page content next to the sidebar (AdminLTE's `.content-wrapper`). Its one job beyond wrapping the page: on
 * phones the open sidebar dims it with an overlay drawn on the wrapper itself (sidebar-overlay.scss), so a tap
 * anywhere on the page closes the sidebar. The click is never stopped or prevented, and without an open phone
 * sidebar `close` does nothing, so the page stays clickable. It is a layout piece used once in `app.hbs`, like the
 * header and sidebar.
 *
 * @class ApplicationContent
 * @namespace Prometheus.Components
 * @extends Component
 */
export default class ApplicationContentComponent extends Component {

    /**
     * The sidebar service whose phone sidebar a tap on the page closes.
     *
     * @property sidebar
     * @type Ember.Service
     * @for ApplicationContent
     * @private
     */
    @service sidebar;

    /**
     * Closes the phone sidebar on a tap on the page. A listener rather than `{{on "click"}}` in the template: the
     * wrapper is a plain `div`, and ember-template-lint's `no-invalid-interactive` rejects `{{on "click"}}` on it,
     * with or without `role="presentation"`. The tap lands on the overlay drawn on it, not on a control.
     *
     * @property closeSidebarOnTap
     * @type Modifier
     * @for ApplicationContent
     * @private
     */
    closeSidebarOnTap = modifier((element) => {
        let close = () => this.sidebar.close();
        element.addEventListener('click', close);

        return () => {
            element.removeEventListener('click', close);
        };
    });
}
