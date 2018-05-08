import { module, test } from 'qunit';
import { visit, fillIn, click } from '@ember/test-helpers';
import { selectChoose } from 'ember-power-select/test-support/helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import $ from "jquery";

module('Acceptance | create issue', function(hooks) {
    setupApplicationTest(hooks);
    setupMirage(hooks);

    test('Creating Issue', async function(assert) {
        server.createList('token', 1);
        server.createList('user', 10);
        server.createList('dashboard', 10);
        server.createList('project', 10);
        server.createList('role', 5);
        server.createList('milestone', 1);
        server.createList('membership', 1);
        server.createList('issuetype', 1);
        //server.createList('issue', 1);

        await visit('/signin');
        await fillIn('input#username','hammad');
        await fillIn('input#password','hammad');
        await click('button[type="submit"]');

        // Required for some odd reason
        await visit('/');
        await visit('/app/project/1/issue/create');
        let name = 'Issue Test 0';
        await fillIn("div[data-field='issue.subject'] input",name);
        await fillIn("div[data-field='issue.description'] .note-editable",'Testing via test runner');
        await selectChoose("div[data-field='issue.type'] .ember-power-select-trigger", 'Task');
        await selectChoose("div[data-field='issue.status'] .ember-power-select-trigger", 'In Progress');
        await selectChoose("div[data-field='issue.priority'] .ember-power-select-trigger", 'High');
        await selectChoose("div[data-field='issue.assignee'] .ember-power-select-trigger", 'Hammad Hassan');
        await selectChoose("div[data-field='issue.owner'] .ember-power-select-trigger", 'Hammad Hassan');
        await fillIn("div[data-field='issue.startDate'] input",'2015-10-10');
        await $('.create-issue button.btn.btn-primary').click();
        server.createList('issue', 1);
        await sleep(2000);

        assert.equal($('.issue-details .issueSubject').html(), name);
    });

});

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
/* eslint-enable no-undef */