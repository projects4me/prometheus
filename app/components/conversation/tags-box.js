/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { group, condition } from 'prometheus/utils/query/ast';
import { serialize } from 'prometheus/utils/query/serializer';

/**
 * The Tags box of a thread: the thread's tags as chips, each linking to the thread list filtered by that tag,
 * and, with the tagged.create or tagged.delete permission, the + that opens the Tags::EditModal.
 *
 * @class TagsBox
 * @namespace Prometheus.Components.Conversation
 * @extends Component
 */
export default class ConversationTagsBoxComponent extends Component {
    @service acl;

    @tracked showModal = false;

    get canEdit() {
        return this.acl.checkAccess('tagged.create') || this.acl.checkAccess('tagged.delete');
    }

    /**
     * The tags of the thread, each with the search query that lists the threads having it
     *
     * @property items
     * @type Array<{name: String, filter: String}>
     * @public
     */
    get items() {
        return (this.args.tags ?? []).map((record) => {
            let name = String(record.tag?.get?.('tag') ?? record.tag?.tag ?? '');
            return { name, filter: serialize(group('AND', [group('AND', [condition('tag.tag', ':', name)])])).query };
        });
    }

    @action
    openModal() {
        this.showModal = true;
    }

    @action
    closeModal() {
        this.showModal = false;
    }
}
