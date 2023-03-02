/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
*/

import Component from '@glimmer/component';

/**
 * This component is used to render daily collaboration of user on our system.
 *
 * @class UserProfileCollaborationComponent
 * @namespace Prometheus.Components
 * @extends Ember.Component
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class UserProfileCollaborationComponent extends Component {

    /**
     * This function returns user collaboration value.
     *
     * @method get
     * @public
     */
    get userCollaboration() {
        return (this.args.collaboration === undefined) ? 0 : this.args.collaboration;
    }
}
