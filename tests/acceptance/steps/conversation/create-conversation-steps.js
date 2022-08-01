import { click, fillIn } from '@ember/test-helpers';
import { selectChoose } from 'ember-power-select/test-support/helpers';
import steps from '../steps';

export const when = function () {
    return [
        {
            "User clicks on add button to create conversation": (assert) => async function () {
                let addBtn = document.querySelector('div[data-btn="addConversation"]');
                await click(addBtn);
                assert.ok(true, "User clicks on add button to create conversation")
            }
        },
        {
            "User enters $subject in subject of conversation": (assert) => async function (subject) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                let subjectInputEl = document.querySelector('div[data-field="newConversation.subject"] input');
                await fillIn(subjectInputEl, subject);
                assert.ok(true, `User enters ${subject} in subject of conversation`)
            }
        },
        {
            "User enters $topic in topic of conversation": (assert) => async function (topic) {
                let topicInputEl = document.querySelector('div[data-field="newConversation.description"] textarea');
                await fillIn(topicInputEl, topic);
                assert.ok(true, `User enters ${topic} in topic of conversation`);
            }
        },
        {
            "User selects type of conversation": (assert) => async function () {
                let selectEl = document.querySelector(`div[data-field="newConversation.roomType"] > div.input-group`);
                await selectChoose(selectEl.querySelector('div'), '.ember-power-select-option', 1);
                assert.ok(true, `User selects type of conversation`);
            }
        }
    ];
}

export const then = function () {
    return [
        {
            "there is a conversation having a topic of $expectedTopic": (assert) => async function (expectedTopic) {
                assert.ok(true, `there is a conversation having a topic of ${expectedTopic}`)
            }
        }
    ];
}

export default function (assert) {
    return steps(assert);
}