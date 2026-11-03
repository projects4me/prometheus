import { click, fillIn } from '@ember/test-helpers';
import steps from '../steps';

export const when = function () {
    return [
        {
            "User clicks on estimate time": (assert) => async function () {
                await click('a#addEstimateTime');
                assert.ok(true, 'Estimate time dialog opened');
            }
        },
        {
            "User enter $description in description for estimate time": (assert) => async function (description) {
                await fillIn('div[data-field="issue.estimateTime"] textarea', description);
                assert.ok(true, "description for issue time log added");
            }
        },
        {
            "User clicks on edit estimate": (assert) => async function () {
                await click('li[data-issue-estimate-id] a .fa-pencil');
                assert.ok(true, 'Edit estimate dialog opened');
            }
        },
        {
            "User sets estimate to $days days $hours hours $minutes minutes": (assert) => async function (days, hours, minutes) {
                await fillIn('div.days input', days);
                await fillIn('div.hours input', hours);
                await fillIn('div.minutes input', minutes);
                assert.ok(true, 'Estimate time changed');
            }
        },
        {
            "User enter $description in description for edited estimate": (assert) => async function (description) {
                await fillIn('div[data-field="issue.editEstimateTime"] div.tui-editor-contents[contenteditable="true"]', description);
                assert.ok(true, 'Estimate description changed');
            }
        },
    ];
}

export const then = function () {
    return [
        {
            "User should see estimate updated message": (assert) => async function () {
                let messages = Array.from(document.querySelectorAll('.messenger-message')).map((el) => el.textContent);
                assert.ok(
                    messages.some((text) => text.includes('Time estimated has been updated')),
                    'Estimate updated message is displayed'
                );
                if (typeof Messenger !== 'undefined') {
                    Messenger().hideAll();
                }
            }
        },
        {
            "Estimate description is $description": (assert) => async function (description) {
                assert.dom('li[data-issue-estimate-id] .log-description').containsText(description);
            }
        },
    ];
}

export default function (assert) {
    return steps(assert);
}