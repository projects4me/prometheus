/* Licensing : http://legal.projects4.me/LICENSE.txt, please don't remove :) */
import Ember from "ember";

/* Maintain some global variables to keep a track of what has happened */
var alreadyRun = false;
var oldConsole = {};


/**
  This is the initializer for the javascript behaviors in the application. We
  are using some libraries that needs to intiate some behaviors like pave and
  tooltip that is accomplished using this initializer.

  @class JavascriptBehaviorsInitializer
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
  name: 'javascript-behaviors',

  /**
    This function is called by Emberjs by default and in this application we
    setup the Logger configuration which can be overwritter in the environment
    configuration.

    @method initialize
    @private
  */
  initialize: function() {
    if (alreadyRun) {
      return;
    } else {
      alreadyRun = true;
    }
    Ember.Router.reopen({
      startProgress:function(){
        Pace.restart();
      }.on('willTransition'),

      initComponents:function(){
        Ember.$(function () {
          Ember.$('[data-toggle="tooltip"]').tooltip();
        });
      }.on('didTransition')
    });

    console.history = [];
    for (var i in console) {
    if (typeof console[i] === 'function') {
      oldConsole[i] = console[i];
      var strr = '(function(){console.history.push({func:\'' + i + '\',args : Array.prototype.slice.call(arguments)});oldConsole[\'' + i + '\'].apply(console, arguments);})';
      console[i] = eval(strr);
      }
    }
  }
};
