/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';

/**
 * Role list card — name, granted/denied access labels, description, members, modified date.
 *
 * @class RoleCardComponent
 * @namespace Prometheus.Components
 * @extends Glimmer.Component
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class RoleCardComponent extends Component {

    /**
     * Derives up to two initials from the role name.
     *
     * @property initials
     * @type {string}
     */
    get initials() {
        let name = (this.args.role && this.args.role.name) || '';
        return name
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map((word) => word.charAt(0).toUpperCase())
            .join('');
    }

    /**
     * Granted coverage % (0 when unknown).
     *
     * @property grantedPercent
     * @type {number}
     */
    get grantedPercent() {
        let pct = this.args.coverage;
        if (pct === undefined || pct === null || Number.isNaN(Number(pct))) {
            return 0;
        }
        return Math.max(0, Math.min(100, Number(pct)));
    }

    /**
     * Denied coverage % (complement of granted).
     *
     * @property deniedPercent
     * @type {number}
     */
    get deniedPercent() {
        if (!this.hasCoverage) {
            return 0;
        }
        return Math.max(0, 100 - this.grantedPercent);
    }

    /**
     * Whether a real coverage value was passed (including 0).
     *
     * @property hasCoverage
     * @type {boolean}
     */
    get hasCoverage() {
        let pct = this.args.coverage;
        return pct !== undefined && pct !== null;
    }

    /**
     * Whether the role has a non-empty description.
     *
     * @property hasDescription
     * @type {boolean}
     */
    get hasDescription() {
        let description = this.args.role && this.args.role.description;
        return !!(description && String(description).trim());
    }

    /**
     * Members assigned to this role (users).
     *
     * @property members
     * @type {Array}
     */
    get members() {
        return this.args.members || [];
    }

    /**
     * Prefer dateModified; fall back to dateCreated.
     *
     * @property modifiedDate
     * @type {string}
     */
    get modifiedDate() {
        let role = this.args.role;
        if (!role) {
            return null;
        }
        return role.dateModified || role.dateCreated;
    }

    /**
     * Tier key for icon colour (based on granted %).
     *
     * @property tierKey
     * @type {string}
     */
    get tierKey() {
        let pct = this.args.coverage;

        if (pct === undefined || pct === null) {
            return 'none';
        }
        if (pct >= 75) {
            return 'high';
        }
        if (pct >= 50) {
            return 'elevated';
        }
        if (pct >= 25) {
            return 'medium';
        }
        return 'low';
    }

    /**
     * BEM colour modifier class for the icon.
     *
     * @property coverageColorClass
     * @type {string}
     */
    get coverageColorClass() {
        let key = this.tierKey;
        if (key === 'none') {
            return 'role-card--no-coverage';
        }
        return `role-card--${key}`;
    }
}
