import { Factory } from 'miragejs';
import _ from 'lodash';

export default Factory.extend({
    ideaId() {
        return (_.random(1, 10)).toString();
    },
    ideaplanId() {
        return (_.random(1, 10)).toString();
    },
    key() {
        return `issue-${_.random(1, 10)}`;
    }
});
