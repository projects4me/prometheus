/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Application from '@ember/application';
import Resolver from './resolver';
import loadInitializers from 'ember-load-initializers';
import config from './config/environment';

let App;

/**
 * This is the Application variable what is used to extend the Ember Application object
 *
 * @class Application
 * @namespace Prometheus
 * @extends Ember.Application
 * @author Hammad Hassan <gollomer@gmail.com>
 */
App = Application.extend({
    modulePrefix: config.modulePrefix,
    podModulePrefix: config.podModulePrefix,
    Resolver
});

loadInitializers(App, config.modulePrefix);

export default App;
