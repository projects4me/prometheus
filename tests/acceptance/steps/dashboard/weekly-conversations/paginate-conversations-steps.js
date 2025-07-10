import steps from '../../steps';
import {
	setDateForWeeklyWidget,
	filterWeeklyWidgetModel
} from '../../common-steps/widgets';
import Context from '../../../../../mirage/yadda-context/context';

export default function (assert) {
	return steps(assert)
		.given(
			'$count comments are for $week week for conversation $conversationroomId',
			function (count, week, conversationroomId) {
				let conversationroom =
					this.server.schema.conversationrooms.find(
						conversationroomId
					);
				let comments = this.server.createList(
					'comment',
					parseInt(count, 10)
				);
				comments.forEach((comment) => {
					comment.update({
						relatedId: conversationroom.id
					});
				});
				conversationroom.update({
					comments: comments
				});

				setDateForWeeklyWidget(
					this.server.schema.comments.all(),
					count,
					week
				);
				assert.ok(true, this.step);
			}
		)
		.given(
			'There is custom callback setup to filter comments model',
			function () {
				let ctx = new Context();
				ctx.set('customCallback', function (comments) {
					return filterWeeklyWidgetModel('comment', comments);
				});
				assert.ok(true, this.step);
			}
		);
}
