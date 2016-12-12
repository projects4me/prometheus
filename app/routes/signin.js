/* Licensing : http://legal.projects4.me/LICENSE.txt, please don't remove :) */
import Ember from "ember";
import UnauthenticatedRouteMixin from 'ember-simple-auth/mixins/unauthenticated-route-mixin';

/**
  This is the app route, the app route is used

  @class AppRoute
  @extends Ember.Route
  @uses UnauthenticatedRouteMixin
  @author Hammad Hassan gollmer@gmail.com
*/
export default Ember.Route.extend(UnauthenticatedRouteMixin,{
});
