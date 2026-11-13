/* global server */
import steps from '../steps';
import agentFixtureSteps from '../agents/agent-fixtures';
import { click } from '@ember/test-helpers';
import { openSelect, selectGroupNames, selectOptions } from 'prometheus/tests/helpers/select';

const assigneeTrigger = 'div[data-field="issue.assignee"] > div.input-group.select-input';
const ownerTrigger = 'div[data-field="issue.owner"] > div.input-group.select-input';


export default function (assert) {
    return agentFixtureSteps(steps(assert))
        .given('Project $projectId has agent "$name" as a member', async function (projectId, name) {
            let project = server.schema.projects.find(parseInt(projectId, 10));
            let agent = server.schema.agents.findBy({ name });
            project.update({ members: project.members.add(agent.user) });
            assert.ok(true, `Project ${projectId} has agent ${name} as a member`);
        })
        .then('The assignee options have the groups "$people" and "$agents"', async function (people, agents) {
            await openSelect(assigneeTrigger);
            assert.deepEqual(selectGroupNames(), [people, agents], 'assignee groups');
        })
        .then('Agent "$name" is listed under Agents with the text "$text"', async function (name, text) {
            let option = selectOptions()
                .find((el) => el.querySelector('.username')?.textContent.trim() === name);
            assert.ok(option?.querySelector('[data-relate-agent-avatar]'), 'agent has the robot avatar');
            assert.equal(option?.querySelector('[data-relate-agent-sponsor]')?.textContent.trim(), text, 'sponsor text');
            await click(document.body);
        })
        .then('The owner options have no Agents group', async function () {
            await openSelect(ownerTrigger);
            assert.deepEqual(selectGroupNames(), [], 'owner has no groups');
            await click(document.body);
        });
}
