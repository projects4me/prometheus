import steps from '../steps';

export const then = function () {
    return [
        {
            "All projects are present inside latest projects section": (assert) => async function () {
                let latestProjects = server.schema.userlatestprojects.all();
                latestProjects.models.forEach((latestProject) => {
                    assert.dom(`[data-project="${latestProject.name}"]`).exists();
                });
            }
        }
    ];
}

export default function (assert) {
    return steps(assert);
}