import steps from '../steps';

export const then = function () {
    return [
        {
            "The QuickList tab is active": (assert) => async function () {
                assert.dom('[data-ui-tab="quick-list"]').hasClass('active');
            }
        },
        {
            "The QuickList placeholder is shown": (assert) => async function () {
                assert.dom('[data-ui-empty]').hasText('Showcase coming soon');
            }
        }
    ];
};

export default function (assert) {
    return steps(assert);
}
