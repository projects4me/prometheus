import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class AppComponent extends Component {
    /**
     * The i18n library service that is used in order to get the translations
     *
     * @property i18n
     * @type Ember.Service
     * @for Prometheus.Controllers.Prometheus
     * @public
     */
    @service i18n;

    /**
     * The trackedProject service provides id of the selected project
     *
     * @property trackedProject`
     * @type Object
     * @for NavBar
     * @private
     */
    @service trackedProject;

    /**
     * The router service provides access to route
     *
     * @property projectId
     * @type String
     * @for NavBar
     * @private
     */
    @service router;

    /**
     * The current user of the application
     *
     * @property currentUser
     * @type Ember.Service
     * @for ApplicationHeader
     */
    @service currentUser;
}