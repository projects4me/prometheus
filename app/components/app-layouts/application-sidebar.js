/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';

export default class ApplicationSidebarComponent extends Component {

    /**
     * This function returns list of projects
     *
     * @method get
     * @public
     */
    get projectList() {
        return this.args.projectList ?? '';
    }

    /**
     * This function returns current user
     *
     * @method get
     * @public
     */
    get currentUser() {
        return this.args.currentUser ?? '';
    }
}
