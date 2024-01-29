import { Factory } from 'ember-cli-mirage';
import Settings from '../../tests/config-mock/settings';

export default Factory.extend({
    aclSettings() {
        return Settings.aclSettings;
    }
});
