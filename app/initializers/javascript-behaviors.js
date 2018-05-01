/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import EmberRouter from '@ember/routing/router';
import $ from 'jquery';

/* Maintain some global variables to keep a track of what has happened */
var alreadyRun = false;
//var oldConsole = {};

/**
 * This is the initializer for the javascript behaviors in the application. We
 * are using some libraries that needs to intiate some behaviors like pave and
 * tooltip that is accomplished using this initializer.
 *
 * @class JavascriptBehaviors
 * @namespace Prometheus.Initializers
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default {
    /**
     * The name of the initializer
     *
     * @property name
     * @type String
     * @for JavascriptBehaviors
     * @public
     */
    name: 'javascript-behaviors',

    /**
     * This function is called by EmberJs by default and in this application we
     * setup the Logger configuration which can be overwritten in the environment
     * configuration.
     *
     * @method initialize
     * @private
     */
    initialize: function() {
        if (alreadyRun) {
            return;
        } else {
            alreadyRun = true;
        }
        EmberRouter.reopen({
            // startProgress:function(){
            //     Pace.restart();
            // }.on('willTransition'),

            willTransition() {
                Pace.restart();
            },

            didTransition() {
                this._super(...arguments);
                $(function () {
                    $('[data-toggle="tooltip"]').tooltip();
                });
            }

        });

        Messenger.options = {
            extraClasses: 'messenger-fixed messenger-on-top',
            theme: 'air'
        };

        /*
        console.history = [];
        for (let i in console) {
            if (typeof console[i] === 'function') {
                oldConsole[i] = console[i];
                let strr = '(function(){console.history.push({func:\'' + i + '\',args : Array.prototype.slice.call(arguments)});oldConsole[\'' + i + '\'].apply(console, arguments);})';
                console[i] = eval(strr);
            }
        }
        */
    }
};
