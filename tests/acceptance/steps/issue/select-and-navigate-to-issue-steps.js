import { click } from '@ember/test-helpers';
import steps from '../steps';

export const when = function () {
    return [
        {
            "User selects issue $issueIndex from list": (assert) => async function (issueIndex) {
                let issueRows = document.querySelectorAll('div.row.issues table tbody tr');
                let issueToNavigate = issueRows[issueIndex - 1].querySelector('td.issue-subject > a');

                await click(issueToNavigate);
                assert.ok(true, `User selects issue ${issueIndex} from list`);
            }
        }
    ];
}

export default function (assert) {
    return steps(assert);
}
