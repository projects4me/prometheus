/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { buildActivityLines } from 'prometheus/utils/conversation/room-activity';

/**
 * The Activity box of a thread: a sentence and date per recorded activity, with "Show more" for the rest
 *
 * @class ActivityBox
 * @namespace Prometheus.Components.Conversation
 * @extends Component
 */
export default class ConversationActivityBoxComponent extends Component {
    /**
     * The lines to render, from the thread's activities (a ThreadActivities state)
     *
     * @property lines
     * @type Array
     * @public
     */
    get lines() {
        return buildActivityLines(this.args.activities?.records, this.args.roomType);
    }

    /**
     * Loads the rest of the activities
     *
     * @method showMore
     * @public
     */
    @action showMore() {
        return this.args.activities?.loadAll();
    }
}
