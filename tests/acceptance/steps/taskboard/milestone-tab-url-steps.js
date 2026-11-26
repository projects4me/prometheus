/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import steps from '../steps';
import { click, currentURL, find, visit } from '@ember/test-helpers';

const BOARD_URL = '/app/project/project_1/board';

/**
 * Reads the milestone query param of the current URL
 *
 * @method milestoneParam
 * @return {String|null}
 */
function milestoneParam() {
  let url = new URL(currentURL(), 'http://localhost');
  return url.searchParams.get('milestone');
}

export default function (assert) {
  return steps(assert)
    .when('User opens the "$key" milestone tab', async function (key) {
      await click(`[data-milestone-tab][data-milestone-id="${key}"] > a`);
    })
    .when('User opens the board with milestone "$key"', async function (key) {
      await visit(`${BOARD_URL}?milestone=${key}`);
    })
    .when('User reloads the board', async function () {
      await visit(currentURL());
    })
    .when('User clicks Mark as complete checkbox', async function () {
      await click('.milestone-tabs .milestone-mark-complete-button');
    })
    .then('The "$key" milestone tab is open', function (key) {
      let tab = find(`[data-milestone-tab][data-milestone-id="${key}"]`);
      assert.ok(tab, `the ${key} tab exists`);
      assert.true(tab.classList.contains('active'), `the ${key} tab is active`);
      assert.strictEqual(tab.querySelector('a').getAttribute('aria-expanded'), 'true', 'the tab link is expanded');
      assert.dom(`#tab_${key}`).hasClass('active', `the ${key} pane is shown`);
      assert.strictEqual(document.querySelectorAll('[data-milestone-tab].active').length, 1, 'one tab is active');
    })
    .then('The first milestone tab is open', function () {
      let first = find('[data-milestone-tab]');
      assert.ok(first.classList.contains('active'), 'the first tab is active');
      assert.strictEqual(document.querySelectorAll('[data-milestone-tab].active').length, 1, 'one tab is active');
    })
    .then('The "$key" milestone tab is gone', function (key) {
      assert.dom(`[data-milestone-tab][data-milestone-id="${key}"]`).doesNotExist(`the ${key} tab is removed`);
    })
    .then('The board URL has milestone "$key"', function (key) {
      assert.strictEqual(milestoneParam(), key, `the URL has milestone=${key}`);
    })
    .then('The board URL has no milestone', function () {
      assert.strictEqual(milestoneParam(), null, 'the URL has no milestone param');
    })
    .then('The board URL has the first milestone', function () {
      let key = find('[data-milestone-tab]').getAttribute('data-milestone-id');
      assert.strictEqual(milestoneParam(), key, `the URL has milestone=${key}`);
    });
}
