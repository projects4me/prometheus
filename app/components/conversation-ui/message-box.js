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
 * @author Rana Nouman <ranamnouman@yahoo.com>
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
     * This function is used to set comment property
     *
     * @method setContent
     * @for MessageBoxComponent
     * @public
     */
    @action setContent(content) {
        this.comment = content;
    }

}