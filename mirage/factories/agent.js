import { Factory } from 'miragejs';
import * as date from '../helpers/getDate';

export default Factory.extend({
	dateCreated() {
		return date.createdDate(20, 30);
	},
	dateModified() {
		return date.modifiedDate(1, 4);
	},
	name: 'Agent Achilles',
	purpose: 'Implements Projects4Me issues end to end',
	rolePrompt: '# You are an agent\n\nImplement the issue.',
	modelConfig: () => ({ simple: 'sonnet', complex: 'opus', escalation: 'opus' }),
	maxTurns: 80,
	maxRunsPerIssue: 10,
	permissionMode: 'auto'
});
