import steps from '../steps';

export default function (assert) {
	return steps(assert)
	.given('Each milestone has 1 issue with status "$status"', async function (status) {
		let milestone = server.schema.milestones.all().models[0];
		let issueStatus = server.schema.issuestatuses.findBy({name: status});
		server.schema.create('issue', {
			milestoneId: milestone.id,
			status: status,
			statusId: issueStatus.id,
			projectId: milestone.projectId
		});
	})
	.given('Issue has parent issue with status "$status"', async function (status) {
		let milestone = server.schema.milestones.all().models[0];
		let issueStatus = server.schema.issuestatuses.findBy({name: status});
		let parentIssue = server.schema.create('issue', {
			milestoneId: milestone.id,
			status: status,
			statusId: issueStatus.id,
			projectId: milestone.projectId
		});
		let issue = server.schema.issues.all().models[0];
		issue.update({ parentId: parentIssue.id, parentissue: parentIssue });
	})
	.given('Issue has no endDate', function () {
		let issue = server.schema.issues.all().models[0];
		issue.update({ endDate: null });
	})
	.given('Issue has endDate "$endDate"', function (endDate) {
		let issue = server.schema.issues.all().models[0];
		issue.update({ endDate: endDate });
	})
	.given('Issue has future endDate', function () {
		let issue = server.schema.issues.all().models[0];
		let futureDate = moment().add(30, 'days').format('YYYY-MM-DD');
		issue.update({ endDate: futureDate });
	})
	.given('Issue has no description', function () {
		let issue = server.schema.issues.all().models[0];
		issue.update({ description: '' });
	})
	.given('Issue has description "$description"', function (description) {
		let issue = server.schema.issues.all().models[0];
		issue.update({ description: description });
	})
	.given('Issue has no spent timelogs', function () {
		let issue = server.schema.issues.all().models[0];
		issue.update({ spent: [] });
	})
	.given('Issue has spent timelogs', function () {
		let issue = server.schema.issues.all().models[0];
		let timelog = server.schema.create('timelog', {
			days: 0,
			hours: 2,
			minutes: 30
		});
		issue.update({ spent: [timelog] });
	})
	.given('Issue has issuetype "$issuetype"', function (issuetype) {
		let issue = server.schema.issues.all().models[0];
		let issuetypeModel = server.schema.create('issuetype', {
			name: issuetype,
			projectId: issue.projectId
		});
		issue.update({ issuetype: issuetypeModel });
	})
	.then('User should see "$tagText" info tag on first issue', function (tagText) {
		let issue = server.schema.issues.all().models[0];
		let issueEl = document.querySelector(`[data-field-issue-id="${issue.id}"]`);
		let infoTagEl = issueEl.querySelector('.info-tag');
		
		assert.ok(infoTagEl, 'Info tag element should exist');
		assert.equal(infoTagEl.innerText.trim(), tagText, `Should see "${tagText}" info tag`);
	})
	.then('User should see no info tag on first issue', function () {
		let issue = server.schema.issues.all().models[0];
		let issueEl = document.querySelector(`[data-field-issue-id="${issue.id}"]`);
		let infoTagEl = issueEl.querySelector('.info-tag');
		
		assert.notOk(infoTagEl, 'Info tag element should not exist');
	});
}
