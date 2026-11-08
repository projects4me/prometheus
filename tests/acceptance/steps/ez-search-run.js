import { settled, triggerKeyEvent } from '@ember/test-helpers';

/**
 * Runs the ezSearch bar the way a user does on purpose: closes the suggestion menu and presses Ctrl+Enter
 * (a plain Enter only formats the text).
 *
 * @method runSearch
 * @param {String} input Selector of the search input
 */
export async function runSearch(input) {
    await triggerKeyEvent(input, 'keydown', 'Escape');
    await triggerKeyEvent(input, 'keydown', 'Enter', { ctrlKey: true });
}

/**
 * Presses a plain Enter in the bar and settles: it formats the text without running the search.
 *
 * @method pressEnter
 * @param {String} input Selector of the search input
 */
export async function pressEnter(input) {
    await triggerKeyEvent(input, 'keydown', 'Enter');
    await settled();
}
