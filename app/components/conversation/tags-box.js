/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';

/**
 * The Tags box of a thread: the thread's tags as chips, and, with the tagged.create permission, the field that
 * adds an existing or a new tag and the remove button of each chip.
 *
 * @class TagsBox
 * @namespace Prometheus.Components.Conversation
 * @extends Component
 */
export default class ConversationTagsBoxComponent extends Component {
    @service acl;

    noSelection = [];

    get canEdit() {
        return this.acl.checkAccess('tagged.create');
    }

    /**
     * The tag names of the thread, in the order they were added
     *
     * @property names
     * @type Array<{record: Tagged, name: String}>
     * @public
     */
    get items() {
        return (this.args.tags ?? []).map((record) => ({ record, name: String(record.tag?.get?.('tag') ?? record.tag?.tag ?? '') }));
    }

    @action
    add(text) {
        return this.args.onAdd?.(text);
    }

    @action
    addPicked(selected) {
        let picked = Array.from(selected ?? []).pop();
        return picked ? this.args.onAdd?.(picked.label) : undefined;
    }

    @action
    remove(record) {
        return this.args.onRemove?.(record);
    }
}
