/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';

/**
 * The screens of an idea message, one image per screen. Each screen points at an upload
 * related to the idea.
 *
 * @class IdeaMessageScreensComponent
 * @namespace Prometheus.Components
 * @extends Glimmer.Component
 */
export default class IdeaMessageScreensComponent extends Component {
    /**
     * The screens of the message, the screens are a JSON array
     *
     * @property screens
     * @type Array
     * @public
     */
    get screens() {
        let screens = this.args.screens;
        return Array.isArray(screens) ? screens.filter(screen => screen?.uploadId) : [];
    }
}
