import { modifier } from 'ember-modifier';
import Editor from '@toast-ui/editor';
export default modifier(function initializeToastui(element/*, params, hash*/) {
    const editor = new Editor({
        el: element,
        height: '600px',
        previewStyle: 'vertical'
      });
});
