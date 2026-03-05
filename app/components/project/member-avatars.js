/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import AppComponent from 'prometheus/components/app';

/**
 * This component renders a compact stack of member avatars for a project row,
 * showing up to `maxVisible` images and a "+N" overflow badge for the rest.
 *
 * @class ProjectMemberAvatarsComponent
 * @namespace Prometheus.Components.Project
 * @extends AppComponent
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class ProjectMemberAvatarsComponent extends AppComponent {

    /**
     * Maximum number of avatars to display before showing the overflow badge.
     *
     * @property maxVisible
     * @type Number
     * @for ProjectMemberAvatarsComponent
     * @private
     */
    maxVisible = 4;

    /**
     * The slice of members that will be rendered as individual avatars.
     *
     * @property visibleMembers
     * @type Array
     * @for ProjectMemberAvatarsComponent
     */
    get visibleMembers() {
        let members = this.args.members;
        if (!members) {
            return [];
        }
        return members.slice(0, this.maxVisible);
    }

    /**
     * The number of members that are not shown as individual avatars.
     *
     * @property overflowCount
     * @type Number
     * @for ProjectMemberAvatarsComponent
     */
    get overflowCount() {
        let members = this.args.members;
        if (!members) {
            return 0;
        }
        let total = members.length;
        return total > this.maxVisible ? total - this.maxVisible : 0;
    }
}
