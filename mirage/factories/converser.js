import { Factory } from 'ember-cli-mirage';

export default Factory.extend({
    userId() {
        return (_.random(1, 10)).toString();
    },
    chatRoomId() {
        return (_.random(1, 4)).toString();
    }
});
