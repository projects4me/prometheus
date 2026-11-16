/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { service } from '@ember/service';
import { get } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import ENV from 'prometheus/config/environment';
import { isDefaultProfilePicture } from 'prometheus/models/user';
import { initials, identity, PATTERNS } from 'prometheus/utils/ui/avatar-identity';

const SIZES = ['xs', 's', 'm', 'ml', 'l'];
const ALIASES = { sm: 's' };
const PIXELS = { xs: 20, s: 30, m: 40, ml: 64, l: 96 };

function standardSize(value) {
    let size = ALIASES[value] ?? value;

    return SIZES.includes(size) ? size : null;
}

/**
 * The round picture of a user (person or agent) in the standard sizes xs, s, m (default), ml (64px, for member grids) and l. A person
 * without an image, or whose image fails to load, shows the initials on a generated background that is stable
 * per user (or a user icon when there is no name). An agent shows its own picture with
 * a small robot marker, or the robot icon when it has none.
 *
 * With `@minSize` the avatar steps down from `@size` to the largest standard size that fits the content width of
 * its parent, and never below `@minSize`. It decides from the parent's width only, never from its own, so a parent
 * whose width follows its content settles instead of oscillating. Without `@minSize` nothing is measured.
 *
 * @class AppUiAvatarComponent
 * @namespace Prometheus.Components
 * @extends Glimmer.Component
 */
export default class AppUiAvatarComponent extends Component {
    @service agentDirectory;

    @tracked failed = false;
    @tracked parentWidth = null;

    constructor() {
        super(...arguments);
        this.agentDirectory.load();
    }

    /**
     * The requested standard size: the alias resolved, an unknown value falling back to m.
     *
     * @property requestedSize
     * @type String
     */
    get requestedSize() {
        return standardSize(this.args.size) ?? 'm';
    }

    /**
     * The sizes the avatar may render with @minSize, largest first: from @size down to @minSize. Empty when
     * @minSize is missing, unknown, or not smaller than @size, which keeps the size fixed.
     *
     * @property steps
     * @type Array
     */
    get steps() {
        let min = standardSize(this.args.minSize);
        let top = SIZES.indexOf(this.requestedSize);
        let bottom = SIZES.indexOf(min);
        if (!min || bottom >= top) {
            return [];
        }

        return SIZES.slice(bottom, top + 1).reverse();
    }

    /**
     * Receives the parent's content width; only set while there are sizes to step through.
     *
     * @property onParentWidth
     * @type Function|null
     */
    get onParentWidth() {
        return this.steps.length ? this.setParentWidth : null;
    }

    /**
     * The rendered standard size: @size, or with @minSize the largest step that fits the parent's width
     * (@minSize when none fits).
     *
     * @property size
     * @type String
     */
    get size() {
        let steps = this.steps;
        if (!steps.length || this.parentWidth === null) {
            return this.requestedSize;
        }

        return steps.find((size) => PIXELS[size] <= this.parentWidth) ?? steps[steps.length - 1];
    }

    /** Reads through get() so belongsTo proxies (e.g. issue.assignedTo) work as well as plain objects. */
    field(name) {
        let user = this.args.user;

        return user ? get(user, name) : undefined;
    }

    get isAgent() {
        return this.agentDirectory.isAgent(this.field('id'), this.field('type'));
    }

    get hasPicture() {
        return !isDefaultProfilePicture(this.field('profilePicture'));
    }

    get title() {
        let name = this.field('name') ?? '';

        return this.isAgent ? `${name} (agent)`.trim() : name;
    }

    get imageUrl() {
        let id = this.field('id');

        return id ? `${ENV.api.host}/userimage/get/${id}` : null;
    }

    get showInitials() {
        return !this.imageUrl || this.failed;
    }

    get initials() {
        return initials(this.field('name'), this.size);
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

    setParentWidth = (width) => {
        if (!this.isDestroying && !this.isDestroyed) {
            this.parentWidth = width;
        }
    };

    onError = () => {
        this.failed = true;
    };
}
