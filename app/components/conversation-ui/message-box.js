import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class MessageBoxComponent extends Component{

    @tracked comment;

    @action setContent(content) {
        this.comment = content;
    }

}