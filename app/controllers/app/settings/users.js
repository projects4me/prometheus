/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import AppUserManagementController from 'prometheus/controllers/app/user/management';

/**
 * The controller for the Users page of the Settings area. It is the user
 * management screen rendered inside the settings layout.
 *
 * @class AppSettingsUsersController
 * @namespace Prometheus.Controllers
 * @module App.Settings
 * @extends AppUserManagementController
 */
export default class AppSettingsUsersController extends AppUserManagementController {

    /**
     * The settings layout supplies the page header, so the screen renders
     * without its own.
     *
     * @property embedded
     * @type Boolean
     * @public
     */
    embedded = true;
}
