/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Controller from '@ember/controller';
import { inject as controller } from '@ember/controller';

/**
 * The controller of the roles index, shown while no role is open: it tells the user when no role matches the search
 *
 * @class AppRoleIndexController
 * @namespace Prometheus.Controllers
 * @module App.Role
 * @extends Controller
 */
export default class AppRoleIndexController extends Controller {
    /**
     * The role browser
     *
     * @property roleBrowser
     * @type Prometheus.Controllers.App.Role
     * @public
     */
    @controller('app.role') roleBrowser;

    /**
     * Whether the loaded list holds no role, so the index shows that nothing matches
     *
     * @property showNoMatch
     * @type Boolean
     * @public
     */
    get showNoMatch() {
        return this.roleBrowser.isListLoaded && this.roleBrowser.roles.length === 0;
    }
}
