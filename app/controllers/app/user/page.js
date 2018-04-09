/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

/* Licensing : http://legal.projects4.me/LICENSE.txt, please don't remove :) */
import { task } from 'ember-concurrency';
import Controller from '@ember/controller';
import { inject } from '@ember/service';
import { inject as injectController } from '@ember/controller';
import { get } from '@ember/object';
import { set } from '@ember/object';
import $ from 'jquery';
import { computed } from '@ember/object';

/**
 * This controller is used to manage the user detail/page view
 *
 * @class Page
 * @namespace Prometheus.Controllers
 * @module App.User
 * @extends Ember.Controller
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default Controller.extend({

    /**
     * The ESA session storage service
     *
     * @param session
     * @type service
     * @private
     */
    session: inject(),

    /**
     * The current user
     *
     * @param currentUser
     * @type service
     * @private
     */
    currentUser: inject('current-user'),

});