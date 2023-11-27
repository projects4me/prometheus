/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Service from '@ember/service';

/**
 * @class AclStub
 * @namespace Prometheus.Tests
 * @extends Ember.Service
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class AclStub extends Service {
    /**
     * This function is used to check user access on the component. By default it's returning
     * true because we don't want to check user's access in the integration testing.
     * 
     * @method checkAccess
     * @returns boolean
     */
    checkAccess() {
        return true;
    }
}