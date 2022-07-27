import { click } from '@ember/test-helpers';
import steps from '../steps';

export const given = function () {
    return [
        {
            "There is a saved search related to $relatedField": (assert) => async function (relatedField) {
                let savedSearch = server.create('savedsearch');

                savedSearch.update({
                    relatedTo: `${relatedField}`
                });
            }
        }
    ];
}

export const when = function () {
    return [
        {
            "User gives a pause": (assert) => async function () {
                await this.pauseTest();
            }
        },
        {
            "User selects a saved search": (assert) => async function () {
                let savedSearchEl = document.querySelector('div.search-name').parentNode;
                await click(savedSearchEl);
                assert.ok(true, "User selects a saved search");
            }
        },
    ];
}

export const then = function () {
    return [
        {
            "the searched project should be inside list": (assert) => async function () {
                let projectRow = document.querySelector('div.projects.project table tbody tr');
                let expectedProjectName = projectRow.querySelector('td.project-name');
                assert.dom(expectedProjectName).hasText(server.schema.projects.find(1).name);
            }
        },
    ];
}

export default function (assert) {
    return steps(assert);
}