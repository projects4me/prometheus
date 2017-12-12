import Ember from 'ember';

/**
 * This is empty controller, normally we do not create them. However
 * Ember's inject in the child controllers was failing on reload
 * when this controller did not exist. Apparently Ember.inject.controller
 * does not work on run time generated controllers in case of page reload
 *
 * @class Project
 * @namespace Prometheus.Controller
 * @module App
 * @extends Ember.Controller
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default Ember.Controller.extend({
});
