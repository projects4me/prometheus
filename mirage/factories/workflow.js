import { Factory } from 'miragejs';

export default Factory.extend({
    name(i) {
        return `Workflow ${i + 1}`;
    },
    description: null,
    status: 'Draft',
    scope: '[]',
    version: 0
});
