/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

/**
 * Reactively updates the browser tab title based on the current route, the
 * tracked project name, and whether the user has unread notifications.
 *
 * Title format:
 *   Project routes  : [(N) ]<page label> - <project shortcode>
 *   Non-project routes (user, role, admin, etc.): [(N) ]<page label>
 *   Fallback (no label): "Prometheus" from application.hbs
 *
 * Uses ember-page-title with replace=true so this fully replaces the static
 * "Prometheus" fallback set in application.hbs.
 *
 * @class DocumentTitleComponent
 * @namespace Prometheus.Components
 * @extends Component
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class DocumentTitleComponent extends Component {

    /**
     * @property breadcrumb
     * @type Ember.Service
     * @private
     */
    @service breadcrumb;

    /**
     * @property notifications
     * @type Ember.Service
     * @private
     */
    @service notifications;

    /**
     * @property trackedProject
     * @type Ember.Service
     * @private
     */
    @service trackedProject;

    /**
     * Computes the full browser tab title. Reads four tracked sources so
     * Glimmer autotracking re-runs this getter (and re-invokes page-title)
     * whenever any of them changes:
     *   - breadcrumb.currentPageLabel      → route changes + dynamic record titles
     *   - breadcrumb.isProjectRelatedRoute → changes on every route transition
     *   - trackedProject.shortCode         → project selection changes
     *   - notifications.unreadCount        → notification badge changes
     *
     * @property title
     * @type String
     * @public
     */
    get title() {
        const label      = this.breadcrumb.currentPageLabel;
        const bell       = this.notifications.unreadCount > 0 ? `(${this.notifications.unreadCount}) ` : '';

        if (this.breadcrumb.isProjectRelatedRoute) {
            const project = this.trackedProject.shortCode?.toUpperCase();
            return label ? `${bell}${label} - ${project}` : `${bell}${project}`;
        }

        return label ? `${bell}${label}` : null;
    }
}
