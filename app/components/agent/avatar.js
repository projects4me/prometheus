/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { get } from '@ember/object';
import { isDefaultProfilePicture } from 'prometheus/models/user';

/** Read through get() because the user may be a belongsTo proxy (e.g. issue.assignedTo). */
const PICTURE = 'profilePicture';

/**
 * The avatar of an agent: the picture of its user when it has one, the robot otherwise.
 *
 * @class AgentAvatarComponent
 * @namespace Prometheus.Components
 * @extends Glimmer.Component
 */
export default class AgentAvatarComponent extends Component {
    get picture() {
        let user = this.args.user;
        let picture = user ? get(user, PICTURE) : undefined;

        return isDefaultProfilePicture(picture) ? null : picture;
    }
}
