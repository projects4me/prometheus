export function register(server, ctx) {
	server.post('/issueplanning', (schema, request) => {
		let plan = {};
		if(ctx.get('customCallback')) {
			plan = ctx.get('customCallback')();
		}

		return {
			success: true,
			message: 'Issue plan generated successfully',
			data: JSON.stringify(plan)
		};
	});
} 