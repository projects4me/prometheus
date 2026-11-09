import { Factory } from 'ember-cli-mirage';

export default Factory.extend({
    name(i) {
        return `token-${i + 1}`;
    },
    kind: 'runtime',
    usedAt: null,
    expiresAt() {
        return new Date(Date.now() + 10 * 60 * 1000).toISOString();
    }
});
