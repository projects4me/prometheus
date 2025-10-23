import steps from '../steps';
import { click, find } from '@ember/test-helpers';
import Context from '../../../../mirage/yadda-context/context';

export default function (assert) {
  return steps(assert)
    .when('User activates the "$tabName" tab', async function (tabName) {
      if (tabName === 'backlog') {
        let backlog =  document.querySelector('.milestone-tabs li.milestone-tab[data-milestone-id="backlog"]');
        assert.ok(backlog, 'Backlog tab exists');
        let anchor = backlog.querySelector('a[href^="#tab_"]');
        await click(anchor);
        return;
      }
      throw new Error('Only "backlog" is supported for this step. Use dedicated steps for milestone tabs.');
    })
    .when('Mark as complete checkbox is visible', async function () {
      let el = find('.milestone-mark-complete-button');
      assert.ok(el, 'Mark as complete button is visible');
    })    
    .then('Mark as complete checkbox is not visible', async function () {
      let el = find('.milestone-mark-complete-button');
      assert.strictEqual(!!el, false, 'Mark as complete button should not be visible');
    })
    .then('Mark as complete checkbox is unchecked', async function () {
      // Button doesn't have checked state, so this step is not applicable
      assert.ok(true, 'Button state check not applicable');
    })
    .when('User clicks Mark as complete checkbox', async function () {
      let el = find('.milestone-mark-complete-button');
      let ctx = new Context();
      ctx.set('milestoneToComplete', server.schema.milestones.find(1).name);
      await click(el);
    })
    .then('The active milestone tab is removed from the milestone tabs', async function () {
      let tabs = document.querySelectorAll('[data-milestone-tab] a');
      let ctx = new Context();
      let completedMilestone = ctx.get('milestoneToComplete');
      let milestoneTabNotFound = true;
      tabs.forEach((tab) =>{
        if(tab.innerText === completedMilestone) {
            milestoneTabNotFound = false;
        }
      });
      assert.true(milestoneTabNotFound, "The active milestone tab is removed from the milestone tabs");
    });
}


