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
                id: "1",
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
                id: "2",
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
        // Check milestone tabs are rendered
        let milestoneTabs = document.querySelectorAll('.milestone-tab');
        assert.equal(milestoneTabs.length, 3, 'Three milestone tabs should be rendered');
        
        // Check tab content
        let tabContent = document.querySelectorAll('.tab-pane');
        assert.equal(tabContent.length, 3, 'Three tab panes should be rendered');

        // Check first tab is active by default
        assert.ok(milestoneTabs[0].classList.contains('active'), 'First milestone tab should be active');
        assert.ok(tabContent[0].classList.contains('active'), 'First tab pane should be active');

        // Check milestone tab names
        let tab1Name = milestoneTabs[0].querySelector('a').innerText.trim();
        let tab2Name = milestoneTabs[1].querySelector('a').innerText.trim();
        let tab3Name = milestoneTabs[2].querySelector('a').innerText.trim();

        assert.ok(tab1Name.includes('Version v0.1'), 'First tab should contain v0.1');
        assert.ok(tab2Name.includes('Version v0.2'), 'Second tab should contain v0.2');
        assert.ok(tab3Name.includes('Backlog'), 'Third tab should contain Backlog');

        // Check milestone tab data attributes
        assert.equal(milestoneTabs[0].getAttribute('data-milestone-id'), '1', 'First tab should have correct milestone ID');
        assert.equal(milestoneTabs[1].getAttribute('data-milestone-id'), '2', 'Second tab should have correct milestone ID');
        assert.equal(milestoneTabs[2].getAttribute('data-milestone-id'), 'backlog', 'Third tab should have backlog ID');


        // Check that milestone boxes are rendered within tab content
        let milestoneBoxes = document.querySelectorAll('div.milestone.box');
        assert.equal(milestoneBoxes.length, 3, 'Three milestone boxes should be rendered');

        // Check progress with percentage
        assert.equal(milestoneBoxes[0].querySelector('div.progress-bar').style.width, '50%', 'First milestone box should have 50% progress');
        assert.equal(milestoneBoxes[1].querySelector('div.progress-bar').style.width, '50%', 'Second milestone box should have 50% progress');
        assert.equal(milestoneBoxes[2].querySelector('div.progress-bar').style.width, '50%', 'Third milestone box should have 50% progress');

        // Check content of done versus total issues
        assert.equal(milestoneBoxes[0].querySelector('.progress-description').innerText, '50% (1/2 Issues)', 'First milestone box should have 1/2 issues');
        assert.equal(milestoneBoxes[1].querySelector('.progress-description').innerText, '50% (1/2 Issues)', 'Second milestone box should have 1/2 issues');
        assert.equal(milestoneBoxes[2].querySelector('.progress-description').innerText, '50% (1/2 Issues)', 'Third milestone box should have 1/2 issues');

        //Sortable checking - check that sortable is attached to lanes
        let lanes = document.querySelectorAll('div.lane.box-body');
        assert.ok(lanes.length > 0, 'Lanes should be present');
        assert.ok(_.some(_.keys(lanes[0]), _.method('includes', 'Sortable')), 'Sortable should be attached to lanes');

        // Check that milestone tabs have data-milestone-tab attribute
        milestoneTabs.forEach((tab, index) => {
            assert.ok(tab.hasAttribute('data-milestone-tab'), `Tab ${index + 1} should have data-milestone-tab attribute`);
        });

        // Check issues are rendered in the first active tab (v0.1)
        let activeTabContent = document.querySelector('.tab-pane.active');
        let activeMilestoneBox = activeTabContent.querySelector('div.milestone.box');
        let activeLanes = activeMilestoneBox.querySelectorAll('div.lane.box-body');
        
        // Find the lane with issues (should be the first one with "new" status)
        let issueLane = null;
        activeLanes.forEach(lane => {
            if (lane.getAttribute('data-field-status') === 'new' && lane.children.length > 0) {
                issueLane = lane;
            }
        });
        
        if (issueLane) {
            let item = issueLane.children[0];
            assert.equal(item.querySelector('h4 > a').innerText, `#${milestones[0].issues[0].issueNumber} -`, `${milestones[0].name} issue number`); //issue number --> 123
            assert.equal(item.getAttribute('data-field-issue-status'), `${milestones[0].issues[0].status}`, `${milestones[0].name} issue status`); //status --> new
        } else {
            assert.ok(false, 'Should find issues in the active tab');
        }
    });
});
