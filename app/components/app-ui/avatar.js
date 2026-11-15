/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';

/**
 * The round picture of a user (person or agent), drawn by Agent::UserAvatar with the AdminLTE img-circle classes.
 *
 * @class AppUiAvatarComponent
 * @namespace Prometheus.Components
 * @extends Glimmer.Component
 */
export default class AppUiAvatarComponent extends Component {
    /**
     * The image classes: img-circle, plus img-sm or img-xs for the AdminLTE sizes.
     *
     * @property class
     * @type String
     */
    get class() {
        let size = this.args.size;

        return ['sm', 'xs'].includes(size) ? `img-circle img-${size}` : 'img-circle';
    }
}
