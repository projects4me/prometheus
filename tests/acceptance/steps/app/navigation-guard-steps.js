/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import steps from '../steps';
import { click, fillIn } from '@ember/test-helpers';

export default function (assert) {
    return steps(assert)

        .given('The navigation guard is initialized', async function () {
            const router = this.owner.lookup('service:router');
            router.has = () => false;
            this.owner.lookup('route:app').registerRouteEvent();
            delete router.has;

            assert.ok(true, 'Navigation guard is initialized');
        })
        .given('A navigation guard check is registered', async function () {
            this.owner.lookup('service:navigation-guard').register(() => true);
            assert.ok(true, 'Navigation guard check is registered');
        })
        .given('The navigation guard check is cleared', async function () {
            this.owner.lookup('service:navigation-guard').clear();
            assert.ok(true, 'Navigation guard check is cleared');
        })
        .when('User enters $value in email field', async function (value) {
            await fillIn('div[data-field="user.email"] input', value);
            assert.ok(true, `User entered "${value}" in the email field`);
        })
        .when('User clicks on the navigation guard confirm button', async function () {
            await click(document.querySelector('[data-action="confirm"] a'));
            assert.ok(true, 'User clicked the "Leave Anyway" button');
        })
        .when('User clicks on dashboard from the sidebar', async function () {
            await click('[data-navigation-module="Dashboard"] a');
            assert.ok(true, 'User clicked the "Dashboard" link');
        })
}
