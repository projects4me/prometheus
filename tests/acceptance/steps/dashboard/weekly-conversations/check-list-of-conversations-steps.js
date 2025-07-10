import steps from '../../steps';

export default function (assert) {
	return steps(assert)
		.given(
			'Conversationroom $conversationroomId has $commentsCount comments',
			function (conversationroomId, commentsCount) {
				const conversationroom =
					this.server.schema.conversationrooms.find(
						conversationroomId
					);
				const comments = this.server.createList(
					'comment',
					parseInt(commentsCount, 10)
				);
				comments.forEach((comment) => {
					comment.update({
						relatedId: conversationroom.id
					});
				});
				conversationroom.update({
					comments: comments
				});
				assert.equal(
					conversationroom.comments.length,
					commentsCount,
					this.step
				);
			}
		)
		.then(
			'There should be $commentCount comments present in weekly conversations widget for conversation $conversationroomId',
			function (commentCount, conversationroomId) {
				const conversationroom =
					this.server.schema.conversationrooms.find(
						conversationroomId
					);
				assert
					.dom(
						`[data-recent-conversations] [data-accordion-section='${conversationroom.id}'] .box-comment`
					)
					.exists({
						count: parseInt(commentCount, 10)
					});
			}
		);
}
