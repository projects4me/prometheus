import Component from '@glimmer/component';

export default class ApplicationSidebarComponent extends Component {
    get projectList() {
        return this.args.projectList ?? '';
    }

    get currentUser() {
        return this.args.currentUser ?? '';
    }
}
