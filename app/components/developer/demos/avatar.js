/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

/**
 * The AppUi::Avatar demo of the Component Library: a person, a person without image, and an agent with and
 * without a picture in each standard size, with controls for the size and for a failing image.
 *
 * @class DeveloperDemosAvatarComponent
 * @namespace Prometheus.Components.Developer.Demos
 * @extends Glimmer.Component
 */
export default class DeveloperDemosAvatarComponent extends Component {
    @tracked size = 'm';
    @tracked imageFails = false;

    sizes = [
        { label: 'xs', value: 'xs' },
        { label: 's', value: 's' },
        { label: 'm', value: 'm' },
        { label: 'ml', value: 'ml' },
        { label: 'l', value: 'l' }
    ];

    get users() {
        return [
            { label: 'Person', record: this.person },
            { label: 'Person without image', record: { id: 0, name: 'No Image', type: 'user' } },
            { label: 'Grace Hopper', record: { name: 'Grace Hopper' } },
            { label: 'Alan Turing', record: { name: 'Alan Turing' } },
            { label: 'Single name', record: { name: 'Plato' } },
            { label: 'Non-Latin name', record: { name: 'علي حسن' } },
            { label: 'No name', record: { id: 15 } },
            { label: 'Agent with picture', record: { id: 2, name: 'Agent Odysseus', type: 'agent', profilePicture: '/img/pm.png' } },
            { label: 'Agent without picture', record: { id: 3, name: 'Agent Achilles', type: 'agent' } }
        ];
    }

    get person() {
        // an id that has no image makes the image fail, so the initials show
        return { id: this.imageFails ? 'missing-image' : 1, name: 'Ada Lovelace', type: 'user' };
    }

    get selectedUser() {
        return this.person;
    }

    @action
    setSize(event) {
        this.size = event.target.value;
    }

    @action
    toggleImageFails(event) {
        this.imageFails = event.target.checked;
    }
}
