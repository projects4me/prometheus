/**
 * Answers Gaia's ranked search (`GET /search?types=issue&q=...&limit=n`) for issues: an issue whose number equals
 * the query is pinned first, then the issues whose subject or description contains it, case-insensitively. Gaia's
 * semantic matching is not modelled; set `searchSemanticUnavailable` in the context to report it as unavailable.
 * Every request's query params are logged in the context as `searchRequests`.
 */
export function register(server, ctx) {
	server.get('/search', (schema, request) => {
		let params = request.queryParams;
		ctx.set('searchRequests', [...(ctx.get('searchRequests') || []), { ...params }]);
		let q = String(params.q || '').trim().toLowerCase();
		let limit = parseInt(params.limit, 10) || 20;

		let exact = [];
		let words = [];
		schema.issues.all().models.forEach((issue) => {
			if (String(issue.issueNumber) === q) {
				exact.push(issue);
			} else if (`${issue.subject || ''} ${issue.description || ''}`.toLowerCase().includes(q)) {
				words.push(issue);
			}
		});

		let data = [...exact, ...words].slice(0, limit).map((issue, rank) => ({
			type: 'searchresult',
			id: `issue:${issue.id}`,
			attributes: {
				module: 'issue',
				recordId: String(issue.id),
				title: issue.subject,
				snippet: issue.description ?? null,
				score: 1 / (rank + 1),
				matchedBy: exact.includes(issue) ? ['exact'] : ['fts'],
				pinned: exact.includes(issue)
			}
		}));

		return {
			data,
			meta: {
				query: params.q,
				types: String(params.types || '').split(','),
				semantic: ctx.get('searchSemanticUnavailable') ? 'unavailable' : 'ok'
			}
		};
	});
}
