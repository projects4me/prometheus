import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Controller | app/project/gantt quick view in the URL', function (hooks) {
	setupTest(hooks);

	hooks.beforeEach(function () {
		this.controller = this.owner.lookup('controller:app/project/gantt');
		this.a = { id: '1', issueNumber: '7' };
		this.controller.milestones = [{ issues: [this.a] }];
	});

	test('opening the quick view sets the issue param and closing clears it', function (assert) {
		this.controller.openIssuePanel(this.a);
		assert.strictEqual(this.controller.issue, 7);
		assert.true(this.controller.isIssuePanelOpen);

		this.controller.closeIssuePanel();
		assert.strictEqual(this.controller.issue, 0);
		assert.false(this.controller.isIssuePanelOpen);
	});

	test('the issue param opens that issue and asks the chart to scroll to it', function (assert) {
		this.controller.showIssueFromUrl(7);
		assert.strictEqual(this.controller.panelIssue, this.a);
		assert.true(this.controller.isIssuePanelOpen);
		assert.strictEqual(this.controller.scrollRequest, this.a);
	});

	test('back and forward open and close it through the param', function (assert) {
		this.controller.issue = 7;
		this.controller.urlState.set({ issue: 7 });
		this.controller.showIssueFromUrl(7);
		assert.true(this.controller.isIssuePanelOpen);
		this.controller.showIssueFromUrl(0);
		assert.false(this.controller.isIssuePanelOpen);
	});

	test('a number that is not on the chart is dropped silently', function (assert) {
		this.controller.issue = 99;
		this.controller.showIssueFromUrl(99);
		assert.strictEqual(this.controller.issue, 0);
		assert.false(this.controller.isIssuePanelOpen);
	});
});
