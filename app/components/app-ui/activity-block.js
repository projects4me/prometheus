/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { set } from '@ember/object';

/**
 * This component is used to render activity block.
 *
 * @class AppUiActivityBlockComponent
 * @namespace Prometheus.Components
 * @extends Ember.Component
 * @author Rana Nouman <ranamnouman@yahoo.com>
 */
export default class AppUiActivityBlockComponent extends Component {

    /**
     * This function returns the type of activity block to render.
     *
     * @method get
     * @public
     */
    get activityBlockType() {
        let activity = this.args.activity;
        this.setActivityTime(activity);
        let componentName = (activity.type == 'related') ? (`related-${activity.relatedActivity}`) :
            ((activity.relatedTo == 'issue' || activity.relatedTo == 'project') ? `${activity.relatedTo}/${activity.type}` : 'index');
        return componentName;
    }

    /**
     * This function is used to set activity created time in humanize format.
     *
     * @method setActivityTime
     * @param {String} activity Activity of user.
     * @public
     */
    setActivityTime(activity) {
        let createdSince = moment.duration(moment(new Date()).diff(moment(activity.dateCreated))).humanize();
        set(activity, "createdSince", createdSince);
    }
}
