/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

/**
 * Metadata for the Settings side navigation. Adding a settings page is one entry
 * in one of the groups: the route, icon, translation key and ACL context.
 *
 * @property SETTINGS_NAVIGATION
 * @type Array
 * @namespace Prometheus.Utils.Settings
 */
export const SETTINGS_NAVIGATION = [
    {
        key: 'access',
        label: 'views.nav.menu.settings.group.access',
        items: [
            {
                key: 'users',
                route: 'app.settings.users',
                icon: 'users',
                label: 'views.nav.menu.user.label',
                aclContext: 'user.read'
            },
            {
                key: 'roles',
                route: 'app.role',
                icon: 'key',
                label: 'views.nav.menu.role.label',
                aclContext: 'role.read'
            }
        ]
    }
];
