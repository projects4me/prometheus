import { upload } from 'ember-file-upload/mirage';

export function register(server) {
	server.post('/upload', upload(function (schema, request) {
		let { file, relatedTo, relatedId } = request.requestBody;
		return schema.uploads.create({
			name: file.name,
			relatedTo,
			relatedId,
			fileType: file.type,
			fileMime: file.type,
			fileSize: String(file.size)
		});
	}));

	server.get('/upload', (schema, request) => {
		let { id, download } = request.queryParams;
		let uploads = id ? schema.uploads.where({ id }) : schema.uploads.all();
		if (download) {
			uploads.models.forEach(record => record.update({ downloadLink: `token-${record.id}` }));
		}
		return uploads;
	});

	server.get('/upload/:id', (schema, request) => {
		return schema.uploads.find(request.params.id);
	});
}
