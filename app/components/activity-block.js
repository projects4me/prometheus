/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@ember/component';
import { inject } from '@ember/service';
import { set } from '@ember/object';
import { computed } from '@ember/object';

/**
 * This component is used to render different activity blocks for the system
 * There is only one component and it points to differnt tempalate dynamically
 * based on the input parameters
 *
 * @class ActivityBlock
 * @namespace Prometheus.Components
 * @extends Ember.Component
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default Component.extend({

    /**
     * The i18n library service that is used in order to get the translations
     *
     * @property i18n
     * @type Ember.Service
     * @for ActivityBlock
     * @private
     */
    i18n: inject(),

    /**
     * We need the component to render inside an li so that the UI does not break
     *
     * @property tagName
     * @type String
     * @for ActivityBlock
     * @private
     */
    tagName: "li",

    /**
     * This is the layout name that determines the HBS file to be rendered, we are
     * using this so that we can created dynamic activity blockers without having to
     * check for the type using if else statements that can be very taxing as the
     * number of activities in the system can grow and comparing the type against
     * each possible combination can be very taxing
     *
     * @property layoutName
     * @type function
     * @for ActivityBlock
     * @private
     */
    layoutName: computed('activity','model', function() {
        let activity = this.get('activity');
        let template = null;

        let createdSince = moment.duration(moment(new Date()).diff(moment(activity.get('dateCreated')))).humanize();
        set(activity,"createdSince",createdSince);


        if (activity.get('type') === 'related'){
            template = 'components/activity-blocks/related-'+activity.get('relatedActivity');
        }
        else {
            template = 'components/activity-blocks/'+activity.get('type');
        }

        if (Prometheus.__container__.lookup('template:'+template) === undefined) {
            template = 'components/activity-blocks/index';
        }

        return template;
    }).volatile(),

});
