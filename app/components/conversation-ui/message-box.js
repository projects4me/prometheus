/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

/**
 * This component is used to render the toast editor and a post button
 *
 * @class MessageBox
 * @namespace Prometheus.Components
 * @extends Ember.Component
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class MessageBoxComponent extends Component{

    /**
     * This property is used to keep track the comment
     *
     * @property comment
     * @type String
     * @for MessageBoxComponent
     * @private
     */
    @tracked comment;

    /**
     * This property is used to keep track of the saving state
     *
     * @property isSaving
     * @type Boolean
     * @for MessageBoxComponent
     * @private
     */
    @tracked isSaving = false;

    /**
     * This property is used to keep track of the mentioned issues
     *
     * @property mentionedIssues
     * @type Array
     * @for MessageBoxComponent
     * @private
     */
    @tracked mentionedIssues = [];

    /**
     * This function is used to set comment property
     *
     * @method setContent
     * @for MessageBoxComponent
     * @public
     */
    @action setContent(content, mentionedIssues) {
        this.mentionedIssues = mentionedIssues;
        this.comment = content;
    }

    /**
     * This function handles keyboard submit (Enter key) for quick posting
     *
     * @method handleKeyboardSubmit
     * @param {String} content The content to submit
     * @for MessageBoxComponent
     * @public
     */
    @action async handleKeyboardSubmit(content, shouldSave = true) {
        if (!content || this.isSaving) {
            return;
        }
        if (this.args.save && this.args.entity && shouldSave) {
            this.isSaving = true;
            await this.args.save(this.args.entity, content, this.mentionedIssues);
            this.isSaving = false;
        }
    }
}