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
