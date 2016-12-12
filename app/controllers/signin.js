/* Licensing : http://legal.projects4.me/LICENSE.txt, please don't remove :) */
import Ember from "ember";

/**
  This the singin controller.

  @class SigninController
  @extends Ember.Controller
  @author Hammad Hassan gollmer@gmail.com
*/

export default Ember.Controller.extend({

  /**
    The session service which is offered by ember-simple-auth that will be used
    in order to verfy whether the used is authenticated

    @property session
    @type Object
    @for AppController
    @public
  */
  session: Ember.inject.service('session'),

  /**
    The events that this controller is listing to

    @property actions
    @type Object
    @for AppController
    @public
  */
  actions: {

    /**
      This function invalidates the session which effectively logs the user out
      of the application

      @method authenticate
      @public
    */
    authenticate() {
      let { username, password } = this.getProperties('username', 'password');
      this.get('session').authenticate('authenticator:oauth2', username, password).catch((reason) => {
        this.set('errorMessage', reason.error || reason);
      });
    }
  }

});
