import steps from '../steps';
import { click } from '@ember/test-helpers';

export default function (assert) {
    return (
        steps(assert)
            .when('User clicks love button on the first conversation', async function () {
                let btn = document.querySelector('.conversation-item[id] [data-btn="toggle-vote"]')
                    || document.querySelector('.conversation-item [data-btn="toggle-vote"]');
                assert.ok(btn, 'Love button (toggle-vote) is present');
                await click(btn);
                assert.ok(true, 'User clicks love button on the first conversation');
            })
            .then('the first conversation shows loved state', function () {
                let firstItem = document.querySelector('.conversation-item[id]') || document.querySelector('.conversation-item');
                assert.ok(firstItem, 'First conversation item exists');
                let filledHeart = firstItem.querySelector('.upvotes .fa-heart');
                assert.ok(filledHeart, 'First conversation shows filled heart (loved state)');
            })
            .then('the first conversation shows unlovable state', function () {
                let firstItem = document.querySelector('.conversation-item[id]') || document.querySelector('.conversation-item');
                assert.ok(firstItem, 'First conversation item exists');
                let outlineHeart = firstItem.querySelector('.upvotes .fa-heart-o');
                assert.ok(outlineHeart, 'First conversation shows outline heart (unlovable state)');
                let filledHeart = firstItem.querySelector('.upvotes .fa-heart');
                assert.notOk(filledHeart, 'First conversation does not show filled heart');
            })
    );
}