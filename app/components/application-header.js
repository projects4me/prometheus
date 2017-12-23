/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Ember from 'ember';

/**
 * This component is used to render the application header
 *
 * @class ApplicationHeader
 * @namespace Prometheus.Components
 * @extends Ember.Component
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default Ember.Component.extend({

    /**
     * The tag to be used for this component
     *
     * @property tagName
     * @for ApplicationHeader
     * @type String
     * @private
     */
    tagName: 'header',

    /**
     * The classes to be rendered with the element
     *
     * @property classNames
     * @for ApplicationHeader
     * @type Array
     * @private
     */
    classNames: ["main-header"],

    /**
     * These are the actions that are supported by this component
     *
     * @property actions
     * @for ApplicationHeader
     * @type Object
     * @public
     */
    actions:{

        /**
         * This function is used to forward the signOut function
         *
         * @method signOut
         * @for ApplicationHeader
         * @public
         */
        signOut(){

            if (typeof this.invalidateSession === 'function')
            {
                this.sendAction('invalidateSession');
            }

        },

        /**
         * This function should not be triggered
         *
         * @method signIn
         * @for ApplicationHeader
         * @public
         */
        signIn(){

        }
    }
});
