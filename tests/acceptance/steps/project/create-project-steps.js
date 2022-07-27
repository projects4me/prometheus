import steps from '../steps';
import { fillIn } from '@ember/test-helpers';

export const when = function () {
    return [
        {
            "User enters $content in project $fieldName": (assert, ctx) => async function (content, fieldName) {
                let inputEl = document.querySelector(`div.form-group div[data-field="project.${fieldName}"] > input`);
                if (!inputEl) {
                    var textareaEl = document.querySelector(`div.form-group div[data-field="project.${fieldName}"] > textarea`);
                }

                let elementToFill = (textareaEl) ? textareaEl : inputEl;
                await fillIn(elementToFill, content);
                assert.ok(true, `User enters ${fieldName}`);
            }
        }
    ];
}

export const then = function () {
    return [
        {
            "Project name is $expectedProjectName": (assert) => async function (expectedProjectName) {
                assert.dom('span.project-name').hasText(expectedProjectName);
            }
        },
        {
            "Project description is $expectedProjectDescription": (assert) => async function (expectedProjectDescription) {
                assert.dom('p.project-description').hasText(expectedProjectDescription);
            }
        },
        {
            "Project vision is $expectedProjectVision": (assert) => async function (expectedProjectVision) {
                assert.dom('p.project-vision').hasText(expectedProjectVision);
            }
        }
    ];
}

export default function (assert) {
    return steps(assert);
}