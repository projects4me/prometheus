import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import AppComponent from 'prometheus/components/app';

/**
 * This component previews a file of an issue in a modal. It picks the view from the mime type of the file
 * and requests a one-time preview token only for the types that can be previewed.
 *
 * @class IssueFilePreviewComponent
 * @namespace Prometheus.Components
 */
export default class IssueFilePreviewComponent extends AppComponent {
    /**
     * Whether the preview token is being fetched
     *
     * @property loading
     * @type boolean
     */
    @tracked loading = false;

    /**
     * Whether fetching the preview token failed
     *
     * @property failed
     * @type boolean
     */
    @tracked failed = false;

    /**
     * The url the file can be previewed at
     *
     * @property previewUrl
     * @type string
     */
    @tracked previewUrl = null;

    /**
     * The file that the latest request belongs to, used to ignore stale responses
     *
     * @property requestedFile
     * @private
     */
    requestedFile = null;

    /**
     * The mime type of the file
     *
     * @property mime
     * @type string
     */
    get mime() {
        return ((this.args.file && this.args.file.fileMime) || '').toLowerCase();
    }

    /**
     * Whether the file is an image
     *
     * @property isImage
     * @type boolean
     */
    get isImage() {
        return this.mime.startsWith('image/');
    }

    /**
     * Whether the file is shown in a sandboxed iframe (only types that cannot run scripts)
     *
     * @property isFrame
     * @type boolean
     */
    get isFrame() {
        return this.mime === 'application/pdf' || this.mime === 'text/plain';
    }

    /**
     * Whether the file is a video
     *
     * @property isVideo
     * @type boolean
     */
    get isVideo() {
        return this.mime.startsWith('video/');
    }

    /**
     * Whether the file is an audio
     *
     * @property isAudio
     * @type boolean
     */
    get isAudio() {
        return this.mime.startsWith('audio/');
    }

    /**
     * Whether the browser can show the file
     *
     * @property canPreview
     * @type boolean
     */
    get canPreview() {
        return this.isImage || this.isFrame || this.isVideo || this.isAudio;
    }

    /**
     * Fetch the preview token for the file when the modal is rendered
     *
     * @method load
     */
    @action async load() {
        const file = this.args.file;
        this.requestedFile = file;
        this.previewUrl = null;
        this.failed = false;
        if (!file || !this.canPreview) {
            this.loading = false;
            return;
        }

        this.loading = true;
        try {
            const uploads = await this.store.query('upload', { id: file.id, download: true });
            if (this.isDestroying || this.isDestroyed || this.requestedFile !== file) {
                return;
            }
            const upload = uploads.objectAt(0);
            const token = upload && upload.get('downloadLink');
            if (!token) {
                this.failed = true;
                this.loading = false;
                return;
            }
            this.previewUrl = this.store.adapterFor('upload').host + '/preview/get/' + token;
        } catch (e) {
            if (this.isDestroying || this.isDestroyed || this.requestedFile !== file) {
                return;
            }
            this.failed = true;
        }
        this.loading = false;
    }

    /**
     * Download the file through the flow of the parent
     *
     * @method download
     */
    @action download() {
        this.args.onDownload(this.args.file);
    }
}
