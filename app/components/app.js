import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

/**
 * This component inject services and other components will extend this component for reusability.
 *
 * @class App
 * @namespace Prometheus.Components
 * @extends Ember.Component
 * @author Rana Nouman <ranamnouman@yahoo.com>
 */
export default class AppComponent extends Component {
    /**
     * The i18n library service that is used in order to get the translations
     *
     * @property i18n
     * @type Ember.Service
     * @for App
     * @public
     */
    @service i18n;

    /**
     * The trackedProject service provides id of the selected project
     *
     * @property trackedProject`
     * @type Ember.Service
     * @for App
     * @private
     */
    @service trackedProject;

    /**
     * The router service provides access to route
     *
     * @property projectId
     * @type String
     * @for App
     * @private
     */
    @service router;

    /**
     * The current user of the application
     *
     * @property currentUser
     * @type Ember.Service
     * @for App
     */
    @service currentUser;
}