/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import getCurrentUrl from 'prometheus/utils/location/current-url'
import { hashSettled } from 'rsvp';
import extractHashSettled from 'prometheus/utils/rsvp/extract-hash-settled';

/**
 * The loading assets route.
 * 
 * @class AppLoadingAssetsRoute
 * @namespace Prometheus.Routes
 * @extends Ember.Route
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class AppLoadingAssetsRoute extends Route {
    /**
     * The current user of the application
     *
     * @property currentUser
     * @type Ember.Service
     * @for AppLoadingAssetsRoute
     * @public
     */
    @service currentUser;

    /**
     * The Ember router service provides access to route
     *
     * @property router
     * @type Ember.Service
     * @for AppLoadingAssetsRoute
     * @public
     */
    @service router;

    /**
     * The session service which is offered by ember-simple-auth that will be used
     * in order to verify whether the used is authenticated
     *
     * @property session
     * @type Ember.Service
     * @for AppLoadingAssetsRoute
     * @public
     */
    @service session;

    /**
     * The settings service maintains all of the system level configurations.
     * 
     * @property settings
     * @type Ember.Service
     * @for AppLoadingAssetsRoute
     * @public
     */
    @service settings;

    /**
     * This is the store service which is used to interact with the data API.
     *
     * @property store
     * @type Ember.Service
     * @for AppLoadingAssetsRoute
     * @protected
     */
    @service store;

    /**
     * This service is used to different types of errors.
     * 
     * @property errorManager
     * @type Ember.Service
     * @for App
     * @protected
     */
    @service errorManager;

    /**
     * This method is called by ember when we enter this route and returns
     * resolved promises to the setupController function. In this method we're
     * fetching loggedin user model by using currentUser service. We'll fetch
     * more things inside this model hook infuture if our application needs some
     * pre-loaded data to use.
     * 
     * @method model
     * @returns Promise
     * @protected
     */
    model() {
        Logger.debug('+Prometheus.Route.App.LoadingAssets::model()');

        let _self = this;

        Logger.debug('-Prometheus.Route.App.LoadingAssets::model()');

        return hashSettled({
            userService: this.currentUser.loadUser(),
            settings: this.settings.loadSettings(),
            users: _self.loadUsers(),
            roles: _self.loadRoles(),
            projects: _self.loadProjects()
        }).then((results) => {
            return extractHashSettled(results);
        }).catch((error) => {
            _self.errorManager.handleError(error);
        });

    }

    /**
     * This function is used to set property to controller. We are setting dataLoaded
     * property to true and after that transitioning user to app route.
     *
     * @method setupController
     * @param {Prometheus.Controllers.LoadingAssets} controller
     * @protected
     */
    setupController(controller, model) {
        Logger.debug('+Prometheus.Route.App.LoadingAssets::setupController()');

        controller.set('dataLoaded', true);
        controller.set('users', model.users);
        controller.set('roles', model.roles);
        controller.set('projects', model.projects);

        let url = getCurrentUrl(this.router);

        if (this.session.oldRequestedUrl) {
            url = this.session.oldRequestedUrl;
            delete this.session['oldRequestedUrl'];
        }

        (url === '/') && (url = 'app');

        Logger.debug('-Prometheus.Route.App.LoadingAssets::setupController()');
        this.router.transitionTo(url);
    }

    /**
     * This function is used to load list of users available in the system.
     * 
     * @method loadUsers
     * @returns {Promise}
     */
    loadUsers() {
        Logger.debug('+Prometheus.Route.App.LoadingAssets::loadUsers()');

        let usersOptions = {
            fields: 'User.id,User.name,User.email',
            sort: 'User.name',
            order: 'ASC',
            limit: -1
        }

        Logger.debug('-Prometheus.Route.App.LoadingAssets::loadUsers()');
        return this.store.query('user', usersOptions);
    }

    /**
     * This function is used to load list of roles available in the system.
     * 
     * @method loadRoles
     * @returns {Promise}
     */
    loadRoles() {
        Logger.debug('+Prometheus.Route.App.LoadingAssets::loadRoles()');

        let rolesOptions = {
            sort: 'Role.name',
            order: 'ASC',
            limit: -1
        };

        Logger.debug('-Prometheus.Route.App.LoadingAssets::loadRoles()');
        return this.store.query('role', rolesOptions);
    }

    /**
     * This function is used to load list of projects available in the system.
     * 
     * @method loadProjects
     * @returns {Promise}
     */
    loadProjects() {
        Logger.debug('+Prometheus.Route.App.LoadingAssets::loadProjects()');

        let projectOptions = {
            fields: "Project.id,Project.name,Project.shortCode",
            query: "((Project.name STARTS A) OR (Project.name STARTS P))",
            sort: 'Project.name',
            order: 'ASC',
            limit: 200
        };

        Logger.debug('-Prometheus.Route.App.LoadingAssets::loadProjects()');
        return this.store.query('project', projectOptions);
    }
}
