import Component from '@glimmer/component';

export default class UserManagementAccountStatusComponent extends Component {
    get userAccountStatus() {
        return this.args.user.accountStatus === 'active' ? true : false;
    }
}
