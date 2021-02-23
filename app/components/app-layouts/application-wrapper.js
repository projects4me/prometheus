import Component from '@glimmer/component';
import { action } from '@ember/object';
import $ from'jquery';

export default class ApplicationWrapperComponent extends Component {
    @action activateAdminLTE(){
        $.AdminLTE.layout.activate();
        $.AdminLTE.boxWidget.activate();
    }
}

