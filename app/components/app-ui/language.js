/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { service } from '@ember/service';

/**
 * This component is used to render dropdown that contains languages.
 *
 * @class AppUiLanguageComponent
 * @namespace Prometheus.Components
 * @extends Ember.Component
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class AppUiLanguageComponent extends Component {

    /**
     * This service is used to handle things related to languages.
     *
     * @property language
     * @type Ember.Service
     * @for AppUiLanguageComponent
     * @public
     */
    @service('language') language;
}