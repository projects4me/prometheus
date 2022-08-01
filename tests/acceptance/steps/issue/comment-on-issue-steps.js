import steps from '../steps';
import { click, fillIn } from '@ember/test-helpers';

export const when = function () {
    return [
        {
            "User add a comment having description $commentDescription": (assert) => async function (commentDescription) {
                let contentEditableDiv = document.querySelector('div.message-box div[contenteditable="true"]');
                let postBtn = document.querySelector('div.message-box button.btn.btn-primary');
                await fillIn(contentEditableDiv, commentDescription);
                await click(postBtn);
                assert.ok(true, "User clicks on add button");
            }
        },
    ];
}

export const then = function () {
    return [
        {
            "$userName has created a comment": (assert, ctx) => async function (userName) {
                assert.dom(document.querySelector('div.box-comment span.username > a')).hasText(userName);
            }
        },
        {
            "Comment having description $commentDescription is created": (assert) => async function (commentDescription) {
                assert.dom(document.querySelector('div.comment-text p')).hasText(commentDescription)
            }
        },
    ];
}

export default function (assert) {
    return steps(assert);
}