import Component from '@glimmer/component';

export default class PriorityIconComponent extends Component {
    get priority() {
        return this.args.priority;
    }

    get getClassName() {
        let priority = this.priority;
        let className = '';

        switch (priority) {
            case 'blocker':
                className = 'fa-ban';
                break;
            case 'critical':
                className = 'fa-angle-double-up';
                break;
            case 'high':
                className = 'fa-arrow-up';
                break;
            case 'medium':
                className = 'fa-dot-circle-o';
                break;
            case 'low':
                className = 'fa-arrow-down';
                break;
            case 'lowest':
                className = 'fa-angle-double-down';
                break;
            default:
                break;
        }

        return className;
    }
}
