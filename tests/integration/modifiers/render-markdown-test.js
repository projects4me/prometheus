/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, waitUntil } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';

/**
 * Waits real time without registering with the test waiters, so a render loop can't keep the wait open
 *
 * @param {Number} ms
 * @return {Promise}
 */
function idle(ms) {
    return new Promise(resolve => window.setTimeout(resolve, ms));
}

module('Integration | Modifier | render-markdown', function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);

    /**
     * Counts the download token requests and the images drawn into the element
     */
    function track(context) {
        let counts = { tokens: 0, images: 0 };
        context.server.pretender.handledRequest = (verb, path, request) => {
            if (verb === 'GET' && path.includes('/upload') && request.queryParams.download) {
                counts.tokens++;
            }
        };
        let observer = new MutationObserver(mutations => mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType !== 1) {
                    return;
                }
                counts.images += node.tagName === 'IMG' ? 1 : node.querySelectorAll('img').length;
            });
        }));
        observer.observe(context.element, { childList: true, subtree: true });
        counts.stop = () => observer.disconnect();
        return counts;
    }

    test('an upload image is requested and drawn once, then the message stays still', async function (assert) {
        this.server.create('upload', { id: '42', name: 'shot.png' });
        let counts = track(this);
        this.set('body', 'Look ![shot.png](upload:42)');

        render(hbs`<div data-body {{render-markdown this.body}}></div>`);
        await waitUntil(() => document.querySelector('[data-body] img'), { timeout: 3000 });
        await idle(300);
        counts.stop();

        assert.strictEqual(counts.tokens, 1, 'one download token');
        assert.strictEqual(counts.images, 1, 'the image is drawn once');
        assert.dom('[data-body] img').hasAttribute('alt', 'shot.png');
        assert.dom('[data-body] img').hasAttribute('src', /\/preview\/get\/token-42$/);
    });

    test('the same markdown again keeps the shown image without a new token', async function (assert) {
        this.server.create('upload', { id: '42', name: 'shot.png' });
        this.set('body', 'Look ![shot.png](upload:42)');
        await render(hbs`<div data-body {{render-markdown this.body}}></div>`);
        await waitUntil(() => document.querySelector('[data-body] img'), { timeout: 3000 });
        let counts = track(this);

        this.set('body', 'Look ![shot.png](upload:42)');
        await idle(100);
        this.set('body', 'Look again ![shot.png](upload:42)');
        await waitUntil(() => document.querySelector('[data-body]').textContent.includes('again'), { timeout: 3000 });
        await idle(300);
        counts.stop();

        assert.strictEqual(counts.tokens, 0, 'the resolved address is kept per upload');
        assert.dom('[data-body] img').hasAttribute('src', /\/preview\/get\/token-42$/);
    });

    test('the name shows first and an unreadable upload stays its name', async function (assert) {
        this.set('body', 'Missing ![gone.png](upload:99)');
        await render(hbs`<div data-body {{render-markdown this.body}}></div>`);
        await idle(300);

        assert.dom('[data-body]').includesText('Missing gone.png');
        assert.dom('[data-body] img').doesNotExist();
    });
});
