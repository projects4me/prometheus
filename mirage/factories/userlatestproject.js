import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';
import Context from '../yadda-context/context';

export default Factory.extend({
    name() {
        return faker.company.name();
    },
    status() {
        return faker.helpers.arrayElement(["new", "in_progress", "pending", "done", "wont_fix"]);
    },
    description() {
        return faker.lorem.sentence();
    },
    userId() {
        return (_.random(1, 10)).toString();
    },
    totalIssues() {
        return (_.random(1, 50)).toString();
    },
    closedIssues() {
        return (_.random(1, 10)).toString();
    },
    shortCode(i) {
        return `PROJECT_${++i}`;
    },    
    afterCreate(project) {
        let ctx = new Context();
        project.update({
            "userId": ctx.get('currentUser').id
        })
    }
});
