/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import _ from 'lodash';

module('Integration | Component | task-board', function (hooks) {
    setupRenderingTest(hooks);

    test('it renders', async function (assert) {
        let milestones = [
            {
                status: "in_progress",
                milestoneType: "version",
                name: "v0.1",
                issues: [
                    {
                        status: "new",
                        issueNumber: "123",
                    }, {
                        issueNumber: "456",
                        status: "done",
                    }
                ]
            },
            {
                status: "planned",
                milestoneType: "version",
                name: "v0.2",
                issues: [
                    {
                        status: "new",
                        issueNumber: "789"
                    }, {
                        status: "done",
                        issueNumber: "1011"
                    }
                ]
            }
        ];

        let statuses = [
            {
                name: "new",
                id: '1'
            },
            {
                name: "in_progress",
                id: '2'
            },
            {
                name: "done",
                id: '3'
            },
            {
                name: "feedback",
                id: '4'
            },
        ];

        let statusClass = {
            new: 'box-info',
            in_progress: 'box-primary',
            done: 'box-success',
            feedback: 'box-warning',
            pending: 'box-danger'
        };

        let backlogIssues = [
            {
                issueNumber: '2221',
                status: 'done'
            }, {
                issueNumber: '2222',
                status: 'new'
            }
        ];

        let backlog = {
            id: null,
            milestoneType: 'backlog',
            status: 'planned',
            issues: backlogIssues
        };

        let updateIssue, openIssue;        
        updateIssue = openIssue  = () => true;

        milestones.pushObject(backlog);

        this.set('milestones', milestones);
        this.set('statuses', statuses);
        this.set('statusClass', statusClass);
        this.set('updateIssue', updateIssue);
        this.set('openIssue', openIssue);

        await render(hbs`
            <AppUi::TaskBoard
                @milestones={{this.milestones}}
                @statuses={{this.statuses}}
                @statusClass={{this.statusClass}}
                @updateIssue={{this.updateIssue}}
                @openIssue={{this.openIssue}}
            />
        `);

        // Board sections checking
        let boardSections = document.querySelectorAll('div.milestone.box');
        assert.equal(boardSections[0].querySelector('div.box-header.with-border > strong').innerText, 'Version v0.1', "Milestone v0.1");
        assert.equal(boardSections[1].querySelector('div.box-header.with-border > strong').innerText, 'Version v0.2', "Milestone v0.2");

        //Sortable checking
        let lane = document.querySelector('div.lane.box-body');
        assert.ok(_.some(_.keys(lane), _.method('includes', 'Sortable')), 'Sortable attached');

        //issues checking on behalf of there status
        //milestone v0.1
        let item = boardSections[0].querySelector('div.lane.box-body').children[0];
        assert.equal(item.querySelector('h4 > a').innerText, `#${milestones[0].issues[0].issueNumber} -`, `${milestones[0].name} issue number`); //issue number --> 123
        assert.equal(item.getAttribute('data-field-issue-status'), `${milestones[0].issues[0].status}`, `${milestones[0].name} issue status`); //status --> new

        //milestone v0.2
        item = boardSections[1].querySelector('div.lane.box-body').children[0];
        assert.equal(item.querySelector('h4 > a').innerText, `#${milestones[1].issues[0].issueNumber} -`, `${milestones[1].name} issue number`); //issue number --> 789
        assert.equal(item.getAttribute('data-field-issue-status'), `${milestones[1].issues[0].status}`, `${milestones[1].name} issue status`); //status --> new

        //backlog
        item = boardSections[2].querySelector('div.lane.box-body').children[0];
        assert.equal(item.querySelector('h4 > a').innerText, `#${backlogIssues[1].issueNumber} -`, 'backlog issue number'); //issue number --> 2221
        assert.equal(item.getAttribute('data-field-issue-status'), `${backlogIssues[1].status}`, 'backlog issue status'); //status --> done
    });
});
