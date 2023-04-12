/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';

/**
 * This renders a field switch components which represents user account status.
 *
 * @class AccountStatus
 * @namespace Prometheus.Components
 * @extends Component
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class UserManagementAccountStatusComponent extends Component {

    /**
     * This function checks whether account status of user is active or not.
     * If it's active then return true otherwise false.
     * 
     * @method get
     */
    get userAccountStatus() {
        return this.args.user.accountStatus === 'active' ? true : false;
    }
}
