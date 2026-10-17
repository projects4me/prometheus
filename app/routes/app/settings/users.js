/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import AppUserManagementRoute from 'prometheus/routes/app/user/management';

/**
 * The Users page of the Settings area. Reuses the User Management screen.
 *
 * @class AppSettingsUsersRoute
 * @namespace Prometheus.Routes
 * @module App.Settings
 * @extends AppUserManagementRoute
 */
export default class AppSettingsUsersRoute extends AppUserManagementRoute {
    templateName = 'app/user/management';
}
