import AppComponent from 'prometheus/components/app';
import { action } from '@ember/object';
import { AGREE_TEXT, DISAGREE_TEXT } from 'prometheus/utils/conversation/thread-counts';

/**
 * The body of a vote thread: the agree/disagree tallies from the thread's votes, the thumbs to vote (locked once
 * the user voted) and the voter list. It only displays; casting the vote is the page's action.
 *
 * @class ConversationVoteBodyComponent
 * @namespace Prometheus.Components
 * @extends AppComponent
 */
export default class ConversationVoteBodyComponent extends AppComponent {
    /**
     * The user's own vote text, null before voting
     *
     * @property myVote
     * @type String|null
     * @public
     */
    get myVote() {
        let userId = this.args.currentUser?.user?.id;
        return userId ? this.args.votes.voteOf(userId) : null;
    }

    /**
     * @property hasVoted
     * @type Boolean
     * @public
     */
    get hasVoted() {
        return this.myVote !== null;
    }

    /**
     * @property votedAgree
     * @type Boolean
     * @public
     */
    get votedAgree() {
        return this.myVote === AGREE_TEXT;
    }

    /**
     * @property votedDisagree
     * @type Boolean
     * @public
     */
    get votedDisagree() {
        return this.myVote === DISAGREE_TEXT;
    }

    /**
     * Votes "I agree"
     *
     * @method voteAgree
     * @public
     */
    @action voteAgree() {
        if (!this.hasVoted) this.args.onVote?.(AGREE_TEXT);
    }

    /**
     * Votes "I disagree"
     *
     * @method voteDisagree
     * @public
     */
    @action voteDisagree() {
        if (!this.hasVoted) this.args.onVote?.(DISAGREE_TEXT);
    }
}
