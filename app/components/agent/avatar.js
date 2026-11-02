/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { isDefaultProfilePicture } from 'prometheus/models/user';

/**
 * The avatar of an agent: the picture of its user when it has one, the robot otherwise.
 *
 * @class AgentAvatarComponent
 * @namespace Prometheus.Components
 * @extends Glimmer.Component
 */
export default class AgentAvatarComponent extends Component {
    get picture() {
        let picture = this.args.user?.profilePicture;

        return isDefaultProfilePicture(picture) ? null : picture;
    }
}
