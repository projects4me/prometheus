/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Route from '@ember/routing/route';
import ENV from "prometheus/config/environment";
import { inject as service } from "@ember/service";

/**
 * The reset password route.
 * 
 * @class ResetPasswordRoute
 * @namespace Prometheus.Routes
 * @extends Ember.Route
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class ResetPasswordRoute extends Route {

    /**
     * The router service provides access to route.
     * 
     * @property router
     * @type Ember.Service
     * @for ResetPasswordRoute
     */
    @service router;

    /**
     * This function is used to validate the reset token before rendering the template.
     * 
     * @param {*} transition 
     */
    async beforeModel(transition) {
        const token = transition.to.queryParams.token;

        await this.validateResetToken(token)
        this.router.resetToken = token;
    }

    /**
     * This function is used to validate the reset token. If token is invalid then
     * it will redirect the user to the signin route.
     * 
     * @param {String} token 
     */
    async validateResetToken(token) {
        const queryParams = new URLSearchParams({
            token: token,
            validateTokenType: 'reset',
        }).toString();

        let url = `${ENV.api.host}/api/v${ENV.api.version}/resetpassword?${queryParams}`;

        let response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        let jsonResponse = await response.json();

        if (jsonResponse.valid !== 'true') {
            this.router.transitionTo('signin');
        }
    }
}
