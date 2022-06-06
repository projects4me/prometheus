/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Route from '@ember/routing/route';
import { inject } from '@ember/service';
import { hash } from 'rsvp';

/**
 * This is the app route, the app route is used
 *
 * @class App
 * @namespace Prometheus.Routes
 * @extends Ember.Route
 * @uses AuthenticatedRouteMixin
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default Route.extend({

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
    
    authenticationRoute: 'signin',
    /**
     * The intl library service that is used in order to get the translations
     *
     * @property intl
     * @type Ember.Service
     * @for App
     * @private
     */
    intl: inject(),

    /**
     * The current user service
     *
     * @property currentUser
     * @type Ember.Service
     * @for App
     * @public
     */
    currentUser: inject(),

    /**
     * The store service that is used to interact ember data APIs.
     *
     * @property store
     * @type Ember.Service
     * @for App
     * @public
     */
    store: inject(),

    /**
     * This function is called by EmberJs before it retrieves the model
     *
     * @method beforeModel
     * @public
     */
    beforeModel(transition) {
        this.session.requireAuthentication(transition, this.authenticationRoute);
        return this.loadCurrentUser();
    },

    afterModel() {
        let _self = this;

        let usersOptions = {
            fields : 'User.id,User.name',
            rels : 'none',
            sort : 'User.name',
            order: 'ASC',
            limit: -1
        };

        let rolesOptions = {
            rels : 'none',
            sort : 'Role.name',
            order: 'ASC',
            limit: -1
        };


        return hash({
            users: _self.store.query('user',usersOptions),
            roles: _self.store.query('role',rolesOptions)
        }).then(function(results){
            Logger.info(results);
            _self.set('users',results.users);
            _self.set('roles',results.roles);
        });
    },

    /**
     * This function catches any issue thrown by the _loadCurrentUser function and
     * invalidates the session
     *
     * @method sessionAuthenticated
     * @protected
     */
    sessionAuthenticated() {
        this._super(...arguments);
        this.loadCurrentUser().catch(() => this.session.invalidate());
    },


    /**
     * This function is used to retrieve the currentUser using the current user
     * service
     *
     * @method setupController
     * @param controller {Object} the controller object for this route
     * @private
     */
    loadCurrentUser() {
        return this.currentUser.loadUser();
    },

    /**
     * The setup controller function that will be called every time the user visits
     * the route, this function is responsible for loading the required data
     *
     * @method setupController
     * @param {Prometheus.Controllers.App} controller the controller object for this route
     * @protected
     */
    setupController:function(controller)
    {
        Logger.debug('Prometheus.App.Route->setupController');

        let _self = this;

        controller.set('roles',this.roles);
        controller.set('users',this.users);

        // Load the required data
        _self._loadProjects(controller);
        //_self._loadRoles(controller);
        //_self._loadUsers(controller);

        Logger.debug('-Prometheus.App.Route->setupController');
    },

    /**
     * This function loads the projects in the system and lists them
     *
     * @param {Prometheus.Controllers.App} controller the controller object for this route
     * @private
     */
    _loadProjects:function(controller)
    {
        Logger.debug('Prometheus.App.Route->loadProjects');
        let _self = this;

        // If the user navigated directly to the wiki project or page then lets setup the project id
        let projectId = this.paramsFor('app.project').project_id;
        let projectName = null;

        _self.set('breadCrumb', {title: 'Dashboard'});
        Logger.debug(projectId);
        Logger.debug(projectName);

        let options = {
            fields: "Project.id,Project.name",
            query: "((Project.name STARTS A) OR (Project.name STARTS P))",
            rels : 'none',
            sort : 'Project.name',
            order: 'ASC',
            limit: 200
        };

        Logger.debug('Retreiving projects list with options '+options);
        _self.store.query('project',options).then(function(data){
            let projectCount = data.get('length');
            let projectList = [];
            let temp = null;
            for (let i=0;i<projectCount;i++)
            {
                temp = data.objectAt(i);
                projectList[i] = {label:temp.get('name'), value:temp.get('id')};
            }
            controller.set('projectList',projectList);

            // if it was a sub route then setup the projectName and id
            if (projectId !== null && projectId !== undefined)
            {
                projectName = data.findBy('id',projectId).get('name');
                controller.set('projectId',projectId);
                controller.set('projectName',projectName);
            }

        });

        Logger.debug('-Prometheus.App.Route->loadProjects');
    },


    /**
     * This function loads all the roles in the system and sets them
     * in the App.Controller
     *
     * @param {Prometheus.Controllers.App} controller the controller object for this route
     * @private
     */
    _loadRoles:function(controller)
    {
        Logger.debug('Prometheus.App.Route->loadRoles');
        let _self = this;

        let rolesOptions = {
            rels : 'none',
            sort : 'Role.name',
            order: 'ASC',
            limit: -1
        };

        let roles = _self.store.query('role',rolesOptions);
        controller.set('roles',roles);

        Logger.debug('-Prometheus.App.Route->loadRoles');
    },

    /**
     * This function loads all the users in the system and sets them
     * in the App.Controller
     *
     * @param {Prometheus.Controllers.App} controller the controller object for this route
     * @private
     */
    _loadUsers:function(controller)
    {
        Logger.debug('Prometheus.App.Route->loadUsers');
        let _self = this;

        let options = {
            fields : 'User.id,User.name',
            rels : 'none',
            sort : 'User.name',
            order: 'ASC',
            limit: -1
        };

        let users = _self.store.query('user',options);
        controller.set('users',users);

        Logger.debug('-Prometheus.App.Route->loadUsers');
    },


});