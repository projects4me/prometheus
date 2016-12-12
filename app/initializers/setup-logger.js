/* Licensing : http://legal.projects4.me/LICENSE.txt, please don't remove :) */
import ENV from "../config/environment";

/**
  This is the initializer for the Logger that we use in the application. Logger
  is initialized in here so that it is available throughout the application.

  @class SetupLoggerInitializer
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
  name: 'setup-logger',

  /**
    This function is called by Emberjs by default and in this application we
    setup the Logger configuration which can be overwritter in the environment
    configuration.

    @method initialize
    @private
  */
  initialize: function() {

    // If the Logger exists in the application
    if (Logger !== undefined)
    {
      // Allow the Logger to use the default logging mechanism of the browser
      // e.g. console.log();
      if (ENV.app.logger.default !== undefined && ENV.app.logger.default){
        Logger.useDefaults();
      }
      // Set the Logger level
      if (ENV.app.logger.level !== undefined){
        Logger.setLevel(Logger[ENV.app.logger.level]);
      }
    }
    else {
      console.error("Logger cannot be found this will cause the application to fail");
    }
  }
};
