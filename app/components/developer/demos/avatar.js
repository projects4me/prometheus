/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';

/**
 * The AppUi::Avatar demo of the Component Library: a person, an agent and a missing image in each size.
 *
 * @class DeveloperDemosAvatarComponent
 * @namespace Prometheus.Components.Developer.Demos
 * @extends Glimmer.Component
 */
export default class DeveloperDemosAvatarComponent extends Component {
    sizes = [
        { label: 'default', value: undefined },
        { label: 'sm', value: 'sm' },
        { label: 'xs', value: 'xs' }
    ];

    users = [
        { label: 'Person', record: { id: 1, name: 'Ada Lovelace', type: 'user' } },
        { label: 'Agent', record: { id: 2, name: 'Agent Odysseus', type: 'agent' } },
        { label: 'Missing image', record: { id: 0, name: 'No Image' } }
    ];
}
