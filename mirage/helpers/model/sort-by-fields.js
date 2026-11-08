/**
 * Sorts records by a comma-separated list of sort fields (e.g. "Idea.createdUser,Idea.title"),
 * applying the order to each field in turn, as Gaia does.
 *
 * @param {String} sort comma-separated sort fields, optionally prefixed by the entity name
 * @param {String} order ASC or DESC, applied to every field
 * @param {Array} records
 * @returns Array the sorted records
 */
export default function sortByFields(sort, order, records) {
	let fields = String(sort || '').split(',').map(field => field.trim().split('.').pop()).filter(Boolean);
	let direction = String(order).toUpperCase() === 'DESC' ? -1 : 1;
	return records.sort((a, b) => {
		for (let field of fields) {
			let result = String(a[field] ?? '').localeCompare(String(b[field] ?? ''), undefined, { numeric: true });
			if (result !== 0) {
				return direction * result;
			}
		}
		return 0;
	});
}
