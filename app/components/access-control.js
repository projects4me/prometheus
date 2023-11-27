/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

/**
 * This component is used to check user access on the component to be yield by using the
 * acl service. If the user has access on the component then it is rendered, otherwise not.
 * 
 * @class AccessControl
 * @namespace Prometheus.Components
 * @extends Ember.Component
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class AccessControlComponent extends Component {
    /**
     * This service holds current authenticated user permissions on different resources of
     * the application.
     *
     * @property acl
     * @type Ember.Service
     * @for AccessControl
     */    
    @service acl;

    /**
     * This method calls checkAccess method of acl service to check user access on the
     * given resource and returns the value.
     */
    get hasAccess() {
        return this.acl.checkAccess(this.args.aclContext);
    }
}
