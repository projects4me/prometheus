import { describe, it, beforeEach, afterEach } from 'mocha';
import { expect } from 'chai';
import startApp from 'prometheus/tests/helpers/start-app';
import destroyApp from 'prometheus/tests/helpers/destroy-app';
import { selectChoose } from 'ember-power-select/test-support/helpers';

/* eslint-disable no-undef */
describe('Acceptance | create issue', function() {
    let application;

    beforeEach(function() {
        application = startApp();
    });

    afterEach(function() {
        destroyApp(application);
    });

    it('Create Issue', async function(done) {
        this.timeout(20000);
        setTimeout(done, 18000);

        await visit('/signin');
        await fillIn('input#username','hammad');
        await fillIn('input#password','hammad');
        await click('button[type="submit"]');

        // Required for some odd reason
        await visit('/');
        await visit('/app/project/f2e540135a9d-e6e3-2423-ac1ef75cd869/issue/create');
        let name = 'Issue Test :: ' + (Math.floor(Math.random()*20000));
        await fillIn("div[data-field='issue.subject'] input",name);
        await fillIn("div[data-field='issue.description'] textarea",'Testing via test runner');
        await selectChoose("div[data-field='issue.type'] .ember-power-select-trigger", 'Epic');
        await selectChoose("div[data-field='issue.status'] .ember-power-select-trigger", 'In Progress');
        await selectChoose("div[data-field='issue.priority'] .ember-power-select-trigger", 'High');
        await selectChoose("div[data-field='issue.assignee'] .ember-power-select-trigger", 'Hammad Hassan');
        await selectChoose("div[data-field='issue.owner'] .ember-power-select-trigger", 'Hammad Hassan');
        await fillIn("div[data-field='issue.startDate'] input",'2015-13-19');
        await click('.create-issue button.btn.btn-primary');
        
        expect(this.$('.issue-details .issueSubject').html().trim()).to.equal(name);
    });
});
/* eslint-enable no-undef */