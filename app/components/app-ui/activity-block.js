/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { set } from '@ember/object';
import { service } from '@ember/service';
import * as dates from 'prometheus/utils/date';
/**
 * This component is used to render activity block.
 *
 * @class AppUiActivityBlockComponent
 * @namespace Prometheus.Components
 * @extends Ember.Component
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class AppUiActivityBlockComponent extends Component {

    /**
     * This property contains the name of modules that are related to activity.
     *
     * @property type
     * @type String
     * @for relatedToList
     * @private
     */
    relatedToList = ["project", "issue"];

    /**
     * This service is used to get current user.
     *
     * @property currentUser
     * @type Service
     * @for AppUiActivityBlockComponent
     */
    @service currentUser;

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
            (this.relatedToList.includes(activity.relatedTo) ? `${activity.relatedTo}/${activity.type}` : 'index');
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
		const elapsed = dates.diff(dates.now(), activity.dateCreated, undefined, { zone: 'UTC' });
        const createdSince = dates.humanizeDuration(elapsed);
        set(activity,"createdSince", createdSince);
    }
}
