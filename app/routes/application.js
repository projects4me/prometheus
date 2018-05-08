/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import ApplicationRouteMixin from 'ember-simple-auth/mixins/application-route-mixin';
import Route from '@ember/routing/route';
import { inject } from '@ember/service';

/**
 * This is the application route, in EmberJs the application route is the main
 * route, this is executed no matter what. We have to use this
 *
 * @class Application
 * @namespace Prometheus.Routes
 * @extend Route
 * @uses ApplicationRouteMixin
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default Route.extend(ApplicationRouteMixin,{

    /**
     * The i18n library service that is used in order to get the translations
     *
     * @property i18n
     * @type Ember.Service
     * @for Application
     * @public
     */
    i18n: inject(),

    /**
     * The session service which is offered by ember-simple-auth that will be used
     * in order to verify whether the used is authenticated
     *
     * @property session
     * @type Object
     * @for Application
     * @public
     */
    session: inject(),

    /**
     * This function get triggered before a model fetch is called, this is
     * called every time and we routing the user to the signin route if a user
     * is not authenticated
     *
     * @method afterModel
     * @private
     */
    beforeModel:function(){
        this._super(...arguments);
        if(!this.get('session.isAuthenticated'))
        {
            this.transitionTo('signin');
        }
    },

    /**
     * This function get triggered right after a model fetch is called, this is
     * called every time and we are setting up the default language in the i18n
     * service
     *
     * @method afterModel
     * @private
     */
    afterModel: function() {
        Logger.debug('ApplicationRoute::afterModel() -- setting the language to '+lang);

        var lang = 'en';
        this.set('i18n.locale',lang);
        this.get('session').set('data.locale', lang);
    },

});