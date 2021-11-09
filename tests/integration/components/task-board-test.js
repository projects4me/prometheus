import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

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
        ]

        let statuses = ["new", "in_progress", "done", "feedback", "pending"];

        let statusClass = {
            new: 'box-info',
            in_progress: 'box-primary',
            done: 'box-success',
            feedback: 'box-warning',
            pending: 'box-danger'
        };

        let backlog = [
            {
                issueNumber: '2221',
                status: 'done'
            }, {
                issueNumber: '2222',
                status: 'new'
            }

        ]

        this.set('milestones', milestones);
        this.set('statuses', statuses);
        this.set('statusClass', statusClass);
        this.set('backlog', backlog);

        await render(hbs`
      <AppUi::TaskBoard
        @milestones = {{milestones}}
        @statuses = {{statuses}}
        @statusClass = {{statusClass}}
        @backlog = {{backlog}}
      />
    `);

        //Board sections checking
        let boardSections = document.querySelectorAll('div.board-container > div.box');
        assert.equal(boardSections[0].querySelector('div.box-header.with-border > strong').innerText, 'Version v0.1', "Milestone v0.1");
        assert.equal(boardSections[1].querySelector('div.box-header.with-border > strong').innerText, 'Version v0.2', "Milestone v0.2");

        //issues checking on behalf of there status
        //milestone v0.1
        let item = boardSections[0].querySelector('div.lane.box-body').children[0];
        assert.equal(item.querySelector('h4 > a').innerText, `#${milestones[0].issues[0].issueNumber} -`, 'issue number'); //issue number --> 123
        assert.equal(item.getAttribute('data-field-issue-status'), `${milestones[0].issues[0].status}`, 'issue status'); //status --> new

        //milestone v0.2
        item = boardSections[1].querySelector('div.lane.box-body').children[0];
        assert.equal(item.querySelector('h4 > a').innerText, `#${milestones[1].issues[0].issueNumber} -`, 'issue number'); //issue number --> 789
        assert.equal(item.getAttribute('data-field-issue-status'), `${milestones[1].issues[0].status}`, 'issue status'); //status --> new

        //backlog
        item = boardSections[2].querySelector('div.lane.box-body').children[2];
        assert.equal(item.querySelector('h4 > a').innerText, `#${backlog[0].issueNumber} -`, 'issue number'); //issue number --> 2221
        assert.equal(item.getAttribute('data-field-issue-status'), `${backlog[0].status}`, 'issue status'); //status --> done
        await new Promise(resolve => setTimeout(resolve, 100000));
    });
});
