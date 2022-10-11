import { Factory } from 'ember-cli-mirage';
import faker from 'faker';
import Context from '../yadda-context/context';

export default Factory.extend({
    name() {
        return faker.company.companyName(0);
    },
    status() {
        return faker.random.arrayElement(["new", "in_progress", "pending", "done", "wont_fix"]);
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
    afterCreate(project) {
        let ctx = new Context();
        project.update({
            "shortCode": (project.name.split(' '))[0].toUpperCase(),
            "userId": ctx.get('currentUser').id
        })
    }
});
