/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { QUICK_LIST_FIXTURE_TAGS } from 'prometheus/utils/dev/quick-list-fixture';

const REMOVABLE = ['design', 'backend', 'urgent'];
const ROW = [
    'bug',
    'frontend',
    'api',
    'release',
    'a-very-long-tag-text-that-does-not-fit-in-the-maximum-width-of-a-tag',
    'docs',
    'security',
    'performance',
    'customer',
    'regression',
    'review'
];

/**
 * The AppUi::Tag demo of the Component Library: variants, colour from text, removable tags and a wrapping row.
 *
 * @class DeveloperDemosTagComponent
 * @namespace Prometheus.Components.Developer.Demos
 * @extends Glimmer.Component
 */
export default class DeveloperDemosTagComponent extends Component {
    tags = QUICK_LIST_FIXTURE_TAGS;

    variants = ['default', 'primary', 'info', 'success', 'warning', 'danger'];

    row = ROW;

    @tracked removable = REMOVABLE;

    @tracked log = '';

    /**
     * Logs @onRemove and removes the tag from the demo row.
     *
     * @method remove
     * @param {String} tag The tag
     */
    @action
    remove(tag) {
        this.log += `onRemove: ${tag}\n`;
        this.removable = this.removable.filter((item) => item !== tag);
    }

    /**
     * Brings the removed tags back and clears the log.
     *
     * @method reset
     */
    @action
    reset() {
        this.removable = REMOVABLE;
        this.log = '';
    }
}
