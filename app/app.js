/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import './deprecation-workflow';
import Application from '@ember/application';
import Resolver from './resolver';
import loadInitializers from 'ember-load-initializers';
import config from './config/environment';

/**
 * This is the Application class of Prometheus
 *
 * @class Application
 * @namespace Prometheus
 * @extends Ember.Application
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default class App extends Application {
    modulePrefix = config.modulePrefix;
    podModulePrefix = config.podModulePrefix;
    Resolver = Resolver;
}

loadInitializers(App, config.modulePrefix);
