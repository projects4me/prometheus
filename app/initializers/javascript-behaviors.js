/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import $ from 'jquery';
import { applyPaceTransportExclusions } from 'prometheus/utils/ui/pace-config';

/* Maintain some global variables to keep a track of what has happened */
var alreadyRun = false;

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
     * apply the Pace transport exclusions, the Messenger options and one delegated
     * tooltip handler on the body, which also covers elements rendered later.
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

        applyPaceTransportExclusions();

        $(document.body).tooltip({ selector: '[data-toggle="tooltip"]' });

        Messenger.options = {
            extraClasses: 'messenger-fixed messenger-on-top',
            theme: 'air'
        };
    }
};
