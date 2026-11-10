import AppComponent from 'prometheus/components/app';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

/**
 * The number of voters shown before "Show all"
 *
 * @property VISIBLE_VOTES
 * @type Number
 */
export const VISIBLE_VOTES = 5;

/**
 * The voters of a vote thread, newest first, the first few shown and the rest on demand
 *
 * @class ConversationVoterListComponent
 * @namespace Prometheus.Components
 * @extends AppComponent
 */
export default class ConversationVoterListComponent extends AppComponent {
    /**
     * Whether all of the votes are shown
     *
     * @property expanded
     * @type Boolean
     * @private
     */
    @tracked expanded = false;

    /**
     * @property visibleVotes
     * @type Array
     * @public
     */
    get visibleVotes() {
        let votes = this.args.votes.newestFirst;
        return this.expanded ? votes : votes.slice(0, VISIBLE_VOTES);
    }

    /**
     * @property hasHidden
     * @type Boolean
     * @public
     */
    get hasHidden() {
        return !this.expanded && this.args.votes.total > VISIBLE_VOTES;
    }

    /**
     * Shows all of the votes
     *
     * @method showAll
     * @public
     */
    @action showAll() {
        this.expanded = true;
    }
}
