import Component from '@glimmer/component';
import ENV from 'prometheus/config/environment';
import { inject as service } from '@ember/service';

/**
 * This component inject services and other components will extend this component for reusability.
 *
 * @class App
 * @namespace Prometheus.Components
 * @extends Ember.Component
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class AppComponent extends Component {
    /**
     * The intl library service that is used in order to get the translations
     *
     * @property intl
     * @type Ember.Service
     * @for App
     * @public
     */
    @service intl;

    /**
     * The trackedProject service provides id of the selected project
     *
     * @property trackedProject
     * @type Ember.Service
     * @for App
     * @private
     */
    @service trackedProject;

    /**
     * The router service provides access to route
     *
     * @property router
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

    /**
     * API's host.
     * 
     * @property apiHost
     * @type String
     * @for App
     */
    apiHost = ENV.api.host;
}