import { Factory } from 'ember-cli-mirage';

export default Factory.extend({
    name(i) {
        return `enrolling-${i + 1}`;
    },
    kind: 'runtime',
    status: 'pending',
    userCode: 'ABCD-1234',
    expiresAt() {
        return new Date(Date.now() + 10 * 60 * 1000).toISOString();
    }
});
