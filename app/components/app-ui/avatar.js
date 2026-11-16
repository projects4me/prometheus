/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import ENV from 'prometheus/config/environment';
import { isDefaultProfilePicture } from 'prometheus/models/user';
import { initials, identity, PATTERNS } from 'prometheus/utils/ui/avatar-identity';

const SIZES = ['xs', 's', 'm', 'l'];
const ALIASES = { sm: 's' };

/**
 * The round picture of a user (person or agent) in the standard sizes xs, s, m (default) and l. A person
 * without an image, or whose image fails to load, shows the initials on a generated background that is stable
 * per user (or a user icon when there is no name). An agent shows its own picture with
 * a small robot marker, or the robot icon when it has none.
 *
 * @class AppUiAvatarComponent
 * @namespace Prometheus.Components
 * @extends Glimmer.Component
 */
export default class AppUiAvatarComponent extends Component {
    @service agentDirectory;

    @tracked failed = false;

    constructor() {
        super(...arguments);
        this.agentDirectory.load();
    }

    /**
     * The standard size: the alias resolved, an unknown value falling back to m.
     *
     * @property size
     * @type String
     */
    get size() {
        let size = ALIASES[this.args.size] ?? this.args.size;

        return SIZES.includes(size) ? size : 'm';
    }

    get isAgent() {
        return this.agentDirectory.isAgent(this.args.user?.id, this.args.user?.type);
    }

    get hasPicture() {
        return !isDefaultProfilePicture(this.args.user?.profilePicture);
    }

    get title() {
        let name = this.args.user?.name ?? '';

        return this.isAgent ? `${name} (agent)`.trim() : name;
    }

    get imageUrl() {
        let id = this.args.user?.id;

        return id ? `${ENV.api.host}/userimage/get/${id}` : null;
    }

    get showInitials() {
        return !this.imageUrl || this.failed;
    }

    get initials() {
        return initials(this.args.user?.name, this.size);
    }

    get identity() {
        let user = this.args.user;

        return identity(user?.id || user?.name || '');
    }

    get identityClass() {
        let { base, pattern } = this.identity;

        return `app-ui-avatar--c${base} app-ui-avatar--p${pattern}`;
    }

    get patternClass() {
        return `app-ui-avatar-pattern app-ui-avatar-pattern--${PATTERNS[this.identity.pattern]} app-ui-avatar--a${this.identity.accent}`;
    }

    onError = () => {
        this.failed = true;
    };
}
