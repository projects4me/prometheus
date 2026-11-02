import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import ENV from 'prometheus/config/environment';

/**
 * The picture of a user: the robot avatar for an agent, the user's image for anyone else.
 *
 * @class AgentUserAvatarComponent
 * @namespace Prometheus.Components
 * @extends Glimmer.Component
 */
export default class AgentUserAvatarComponent extends Component {
    @service agentDirectory;

    constructor() {
        super(...arguments);
        this.agentDirectory.load();
    }

    apiHost = ENV.api.host;

    get isAgent() {
        return this.agentDirectory.isAgent(this.args.userId, this.args.type);
    }
}
