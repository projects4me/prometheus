import steps from '../steps';
import { fillIn } from '@ember/test-helpers';

export const when = function () {
	return [
		{
			'User enters $content in project $fieldName': (assert, ctx) =>
				async function (content, fieldName) {
					let inputEl = document.querySelector(
						`div[data-field="project.${fieldName}"] input`
					);
					if (!inputEl) {
						var textareaEl = document.querySelector(
							`div.form-group div[data-field="project.${fieldName}"] textarea`
						);
					}

					let elementToFill = textareaEl ? textareaEl : inputEl;
					await fillIn(elementToFill, content);
					assert.ok(true, `User enters ${fieldName}`);
				}
		},
		{
			'User enters $content in project description': (assert, ctx) =>
				async function (content) {
					let descriptionEl = document.querySelector(
						'div[data-field="project.description"] [contenteditable="true"]'
					);
					await fillIn(descriptionEl, content);
					assert.ok(true, `User enters description`);
				}
		}
	];
};

export const then = function () {
	return [
		{
			'Project name is $expectedProjectName': (assert) =>
				async function (expectedProjectName) {
					assert
						.dom('span.project-name')
						.hasText(expectedProjectName);
				}
		},
		{
			'Project description is $expectedProjectDescription': (assert) =>
				async function (expectedProjectDescription) {
					assert
						.dom('p.project-description')
						.hasText(expectedProjectDescription);
				}
		},
		{
			'Project vision is $expectedProjectVision': (assert) =>
				async function (expectedProjectVision) {
					assert
						.dom('p.project-vision')
						.hasText(expectedProjectVision);
				}
		},
		{
			'Project issuetypes are $issueType1, $issueType2': (assert, ctx) =>
				async function (issueType1, issueType2) {
					let project = ctx.get('latestCreatedProject');
					let issuetypes = server.schema.projects.find(project.id)
						.issuetypes.models;

					assert.equal(issuetypes[0].name, issueType1);
					assert.equal(issuetypes[1].name, issueType2);
				}
		}
	];
};

export default function (assert) {
	return steps(assert);
}
