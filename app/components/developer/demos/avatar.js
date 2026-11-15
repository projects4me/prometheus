/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

/**
 * The AppUi::Avatar demo of the Component Library: the size of the avatar of a few users.
 *
 * @class DeveloperDemosAvatarComponent
 * @namespace Prometheus.Components.Developer.Demos
 * @extends Glimmer.Component
 */
export default class DeveloperDemosAvatarComponent extends Component {
    sizes = ['sm', 'md', 'lg'];

    // No id, so there is no image request and the initials show
    users = [{ name: 'Ada Lovelace' }, { name: 'Grace' }, { name: 'Agent Odysseus' }];

    @tracked size = 'md';

    /**
     * @method setSize
     * @param {String} size
     */
    @action
    setSize(size) {
        this.size = size;
    }

    /**
     * @method reset
     */
    @action
    reset() {
        this.size = 'md';
    }
}
