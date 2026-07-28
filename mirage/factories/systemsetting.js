import { Factory } from 'ember-cli-mirage';
import Settings from '../helpers/acl-settings';

export default Factory.extend({
    aclSettings() {
        return Settings.aclSettings;
    }
});
