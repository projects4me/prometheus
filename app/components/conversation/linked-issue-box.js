/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { canCreateIssueFromThread } from 'prometheus/utils/conversation/thread-issue';

/**
 * The Linked issue box of a thread: the linked issue, or the button that creates an issue from the thread
 *
 * @class LinkedIssueBox
 * @namespace Prometheus.Components.Conversation
 * @extends Component
 */
export default class ConversationLinkedIssueBoxComponent extends Component {
    /**
     * Whether the box offers to create an issue from the thread: a discussion with no linked issue
     *
     * @property canCreateIssue
     * @type Boolean
     * @public
     */
    get canCreateIssue() {
        return canCreateIssueFromThread(this.args.thread) && !this.args.issue?.issueNumber;
    }
}
