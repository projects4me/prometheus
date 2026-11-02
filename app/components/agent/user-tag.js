import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

/**
 * The AGENT label of a user who is an agent, with 'for <sponsor>' after it when asked. Renders nothing for anyone else.
 *
 * @class AgentUserTagComponent
 * @namespace Prometheus.Components
 * @extends Glimmer.Component
 */
export default class AgentUserTagComponent extends Component {
    @service agentDirectory;

    constructor() {
        super(...arguments);
        this.agentDirectory.load();
    }

    get agent() {
        return this.agentDirectory.find(this.args.userId);
    }

    get isAgent() {
        return this.agentDirectory.isAgent(this.args.userId, this.args.type);
    }

    get sponsorName() {
        return this.args.showSponsor ? this.agent?.sponsor?.name : null;
    }
}
