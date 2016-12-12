/* Licensing : http://legal.projects4.me/LICENSE.txt, please don't remove :) */

/**
  This function is called by Emberjs by default and in this application we
  setup the Logger configuration which can be overwritter in the environment
  configuration.
  Got the suggestion from http://stackoverflow.com/questions/30697674/ember-transitiontoroute-cleanly-in-a-component-without-sendaction#answer-30787510


  @method initialize
  @param application {Object} The application in which to inject a service
  @private
*/
export function initialize(application) {
  application.inject('route', 'router', 'router:main');
  application.inject('component', 'router', 'router:main');
}

/**
  This is the initializer for route, we use this function to inject router in
  our components

  @class InjectRouterInitializer
  @author Hammad Hassan gollomer@gmail.com
*/
export default {

  /**
   The name of the initializer

   @property name
   @type String
   @for Initializer
   @public
  */
  name: 'inject-router',
  /**
   The name of the initializer

   @property name
   @type String
   @for Initializer
   @public
  */
  initialize
};
