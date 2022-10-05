import steps from '../steps';

export const then = function () {
    return [
        {
            "All activities are present inside recent activities section": (assert) => async function () {
                let activities = server.schema.userecentactivities.all();
                activities.models.forEach((activity) => {
                    assert.dom(`[data-activity-block-type="${activity.relatedTo}-${activity.type}"]`).exists();
                });
            }
        }
    ];
}

export default function (assert) {
    return steps(assert);
}