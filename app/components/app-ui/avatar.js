/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import ENV from 'prometheus/config/environment';
import { isDefaultProfilePicture } from 'prometheus/models/user';

/**
 * The round picture of a user (person or agent): the image, or the initials when there is none or it fails.
 *
 * @class AppUiAvatarComponent
 * @namespace Prometheus.Components
 * @extends Glimmer.Component
 */
export default class AppUiAvatarComponent extends Component {
    /**
     * Whether the image failed to load.
     *
     * @property failed
     * @type Boolean
     */
    @tracked failed = false;

    /**
     * The size: sm, md (default) or lg.
     *
     * @property size
     * @type String
     */
    get size() {
        let size = this.args.size;

        return ['sm', 'md', 'lg'].includes(size) ? size : 'md';
    }

    /**
     * The image address: the user's own picture, else the user image endpoint.
     *
     * @property src
     * @type String|null
     */
    get src() {
        let user = this.args.user;
        let picture = user?.profilePicture;

        if (!isDefaultProfilePicture(picture)) {
            return picture;
        }

        return user?.id ? `${ENV.api.host}/userimage/get/${user.id}` : null;
    }

    /**
     * Whether to show the image rather than the initials.
     *
     * @property showImage
     * @type Boolean
     */
    get showImage() {
        return Boolean(this.src) && !this.failed;
    }

    /**
     * Up to two capital letters from the user's name.
     *
     * @property initials
     * @type String
     */
    get initials() {
        let words = String(this.args.user?.name ?? '').trim().split(/\s+/).filter(Boolean);

        return words.slice(0, 2).map((word) => word[0].toUpperCase()).join('');
    }

    /**
     * Falls back to the initials when the image cannot be loaded.
     *
     * @method onError
     */
    @action
    onError() {
        this.failed = true;
    }
}
