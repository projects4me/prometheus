import getRequestData from '../helpers/parse-request';

export function register(server, ctx) {
	server.post('/systemnotificationrecipient', function (schema, request) {
		const attrs = JSON.parse(request.requestBody);

		// Handle the special case for marking all as read
		if (attrs.markAllAsRead && attrs.userId) {
			const userId = attrs.userId;
			const recipients = schema.systemnotificationrecipients.where({
				userId
			});

			recipients.models.forEach((recipient) => {
				recipient.update({ isRead: '1' });
			});

			return { success: true };
		}

		// Mark the current user's notifications about one entity as read
		if (attrs.relatedTo && attrs.relatedId) {
			const userId = schema.users.first()?.id || '1';
			const notificationIds = schema.systemnotifications
				.where({ relatedTo: attrs.relatedTo, relatedId: attrs.relatedId })
				.models.map((n) => n.id);
			const unread = schema.systemnotificationrecipients
				.where({ userId, isRead: '0' })
				.models.filter((r) => notificationIds.includes(r.systemnotificationId));
			unread.forEach((recipient) => recipient.update({ isRead: '1' }));

			return {
				success: true,
				markedCount: unread.length,
				meta: {
					unreadCount: schema.systemnotificationrecipients.where({
						userId,
						isRead: '0'
					}).length
				}
			};
		}

		return schema.systemnotificationrecipients.create(attrs);
	});

	server.patch(
		'/systemnotificationrecipient/:id',
		function (schema, request) {
			const id = request.params.id;
			const requestData = getRequestData(request);
			const recipient = schema.systemnotificationrecipients.find(id);
			const notification = server.schema.systemnotifications.find(
				recipient.systemnotificationId
			);
			recipient.update(requestData.attributes);
			notification.update({
				recipientRecords: [recipient]
			});
			return recipient;
		}
	);
}
