/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
*/

import Component from '@glimmer/component';

/**
 * This component is used to render social links of user
 *
 * @class UserProfileSocialLinks
 * @namespace Prometheus.Components
 * @extends Ember.Component
 * @author Rana Nouman <ranamnouman@yahoo.com>
 */
export default class UserProfileSocialLinksComponent extends Component {
    /**
     * This method returns user.
     *
     * @method get
     * @public
     */
    get user() {
        return this.args.user;
    }

    /**
     * This method return redirect function of the 'user.page' controller
     *
     * @method get
     * @public
     */
    get redirect() {
        debugger;
        return this.args.redirect;
    }
}
