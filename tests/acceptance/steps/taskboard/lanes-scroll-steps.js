import steps from '../steps';

export default function (assert) {
    return steps(assert)
        .then('The active milestone lanes can be scrolled horizontally', function () {
            let lanes = document.querySelector('.tab-pane.active .milestone.box-body');
            assert.ok(lanes, 'The active milestone lanes box exists');
            assert.ok(lanes.scrollWidth > lanes.clientWidth, `Lanes overflow their box (${lanes.scrollWidth} > ${lanes.clientWidth})`);
            lanes.scrollLeft = 50;
            assert.ok(lanes.scrollLeft > 0, 'Lanes box scrolls sideways');
        });
}
