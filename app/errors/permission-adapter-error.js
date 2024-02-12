// app/errors/custom-adapter-error.js
import AdapterError from '@ember-data/adapter/error';

export default class PermissionAdapterError extends AdapterError {
    constructor(message, detail) {
        super(message);
        this.detail = detail;
    }
}