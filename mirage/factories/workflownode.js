import { Factory } from 'ember-cli-mirage';

export default Factory.extend({
    category: 'trigger',
    kind: 'issue.created',
    config: '{}',
    name: null,
    positionX(i) {
        return 40 + i * 260;
    },
    positionY: 40
});
