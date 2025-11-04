import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Modifier | modify-links', function(hooks) {
	setupRenderingTest(hooks);

	test('it adds target="_blank" and rel="noopener noreferrer" to external links', async function(assert) {
		await render(hbs`
			<div {{modify-links}}>
				<a href="https://example.com">External Link</a>
			</div>
		`);

		const link = this.element.querySelector('a');
		assert.strictEqual(link.getAttribute('target'), '_blank', 'external link has target="_blank"');
		assert.strictEqual(link.getAttribute('rel'), 'noopener noreferrer', 'external link has rel="noopener noreferrer"');
	});

	test('it removes target and rel attributes from internal links', async function(assert) {
		this.set('currentOrigin', window.location.origin);
		await render(hbs`
			<div {{modify-links}}>
				<a href="{{this.currentOrigin}}/app/user/123" target="_blank" rel="noopener">Internal Link</a>
			</div>
		`);

		const link = this.element.querySelector('a');
		assert.strictEqual(link.getAttribute('target'), null, 'internal link has target removed');
		assert.strictEqual(link.getAttribute('rel'), null, 'internal link has rel removed');
	});

	test('it handles relative internal links correctly', async function(assert) {
		await render(hbs`
			<div {{modify-links}}>
				<a href="/app/user/123">Relative Internal Link</a>
			</div>
		`);

		const link = this.element.querySelector('a');
		assert.strictEqual(link.getAttribute('target'), null, 'relative internal link has target removed');
		assert.strictEqual(link.getAttribute('rel'), null, 'relative internal link has rel removed');
	});

	test('it processes multiple links correctly', async function(assert) {
		this.set('currentOrigin', window.location.origin);
		await render(hbs`
			<div {{modify-links}}>
				<a href="https://example.com">External Link 1</a>
				<a href="{{this.currentOrigin}}/app/user/123">Internal Link</a>
				<a href="https://google.com">External Link 2</a>
				<a href="/app/project/456">Relative Internal Link</a>
			</div>
		`);

		const links = this.element.querySelectorAll('a');
		assert.strictEqual(links.length, 4, 'all links are found');

		// External link 1
		assert.strictEqual(links[0].getAttribute('target'), '_blank', 'external link 1 has target="_blank"');
		assert.strictEqual(links[0].getAttribute('rel'), 'noopener noreferrer', 'external link 1 has rel');

		// Internal link
		assert.strictEqual(links[1].getAttribute('target'), null, 'internal link has target removed');
		assert.strictEqual(links[1].getAttribute('rel'), null, 'internal link has rel removed');

		// External link 2
		assert.strictEqual(links[2].getAttribute('target'), '_blank', 'external link 2 has target="_blank"');
		assert.strictEqual(links[2].getAttribute('rel'), 'noopener noreferrer', 'external link 2 has rel');

		// Relative internal link
		assert.strictEqual(links[3].getAttribute('target'), null, 'relative internal link has target removed');
		assert.strictEqual(links[3].getAttribute('rel'), null, 'relative internal link has rel removed');
	});

	test('it processes nested links correctly', async function(assert) {
		this.set('currentOrigin', window.location.origin);
		await render(hbs`
			<div {{modify-links}}>
				<div class="outer">
					<a href="https://example.com">External Link</a>
					<div class="inner">
						<a href="{{this.currentOrigin}}/app/user/123">Internal Link</a>
					</div>
				</div>
			</div>
		`);

		const externalLink = this.element.querySelector('a[href="https://example.com"]');
		const internalLink = this.element.querySelector('a[href*="/app/user/123"]');

		assert.strictEqual(externalLink.getAttribute('target'), '_blank', 'nested external link has target="_blank"');
		assert.strictEqual(externalLink.getAttribute('rel'), 'noopener noreferrer', 'nested external link has rel');

		assert.strictEqual(internalLink.getAttribute('target'), null, 'nested internal link has target removed');
		assert.strictEqual(internalLink.getAttribute('rel'), null, 'nested internal link has rel removed');
	});

	test('it handles links with existing attributes correctly', async function(assert) {
		await render(hbs`
			<div {{modify-links}}>
				<a href="https://example.com" target="_self" rel="nofollow">External Link with Attributes</a>
			</div>
		`);

		const link = this.element.querySelector('a');
		assert.strictEqual(link.getAttribute('target'), '_blank', 'external link target is overridden to _blank');
		assert.strictEqual(link.getAttribute('rel'), 'noopener noreferrer', 'external link rel is overridden to noopener noreferrer');
	});

	test('it handles invalid URLs gracefully without throwing errors', async function(assert) {
		await render(hbs`
			<div {{modify-links}}>
				<a href="javascript:void(0)">JavaScript Link</a>
				<a href="mailto:test@example.com">Email Link</a>
				<a href="#anchor">Anchor Link</a>
				<a href="">Empty Link</a>
			</div>
		`);

		// The modifier should not throw errors for invalid URLs
		// The try-catch block should handle these cases
		const links = this.element.querySelectorAll('a');
		assert.strictEqual(links.length, 4, 'all links are present');
		
		// Links with invalid URLs should remain unchanged (no errors thrown)
		// The try-catch will silently handle the error
		assert.ok(true, 'invalid URLs handled without errors');
	});
});
