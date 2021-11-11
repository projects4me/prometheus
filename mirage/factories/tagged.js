import { Factory } from 'ember-cli-mirage';
import _ from 'lodash';

export default Factory.extend({
    relatedId() {
        return (_.random(1, 10)).toString();
    },
    "relatedTo": "user",
    tagId() {
        return (_.random(1, 5));
    }
});