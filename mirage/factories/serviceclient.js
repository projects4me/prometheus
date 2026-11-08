import { Factory } from 'ember-cli-mirage';

export default Factory.extend({
    name(i) {
        return `service-${i + 1}`;
    },
    kind: 'runtime',
    status: 'active',
    scopes() {
        return [];
    },
    lastUsedAt: null
});
