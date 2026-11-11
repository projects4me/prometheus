import { Factory } from 'miragejs';
import Settings from '../helpers/acl-settings';

export default Factory.extend({
    aclSettings() {
        return Settings.aclSettings;
    }
});
