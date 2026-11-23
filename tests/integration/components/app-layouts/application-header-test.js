/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { hbs } from 'ember-cli-htmlbars';
import CurrentUserStub from '../../stub-services/current-user-stub';
import AclStub from '../../stub-services/acl-stub';
import { openSelect, typeInSelectSearch, noMatchesSelector } from 'prometheus/tests/helpers/select';
import { Response } from 'miragejs';

module('Integration | Component | application-header', function (hooks) {
    setupRenderingTest(hooks);

    hooks.beforeEach(function(assert) {
        this.owner.register('service:acl', AclStub);
        this.owner.register('service:current-user', CurrentUserStub);
    });

    test('it renders component with the sign out button', async function (assert) {
        let session = {
            isAuthenticated: true
        };
        this.set('session', session);

        await render(hbs`
            <AppLayouts::ApplicationHeader
                @session={{this.session}}    
            />
        `);

        assert.dom('div#btn-signout > a').hasText('Sign Out', 'signout button exists');
    });

    test('it renders component with the sign in button', async function (assert) {
        let session = {
            isAuthenticated: false
        };
        this.set('session', session);

        await render(hbs`
            <AppLayouts::ApplicationHeader
                @session={{this.session}}    
            />
        `);

        assert.dom('div#btn-signin > a').hasText('Sign In', 'signin button exists');
        assert.dom('div#btn-signin > a').hasAttribute('aria-disabled', 'true');
        assert.dom('div#btn-signin > a').hasClass('disabled');
    });

    test('it shows the online dot on both avatars and the Online row in the profile menu', async function (assert) {
        await render(hbs`
            <AppLayouts::ApplicationHeader />
        `);
        assert.dom('li.user-menu > a .header-avatar-status .header-status-dot').exists('dot on the header avatar');
        assert.dom('li.user-header .header-avatar-status .header-status-dot').exists('dot on the menu avatar');
        assert.dom('li.user-status-row .user-status-label').hasText('Online');
        assert.dom('li.user-status-row .user-status-hint').hasText('Visible to your team');
    });

    test('it renders component with logged in user name and created date of that user', async function (assert) {
        await render(hbs`
            <AppLayouts::ApplicationHeader />
        `);
        assert.dom('header li.dropdown.user.user-menu span#user-name').hasText('Rana Nouman', 'current username matched');
        assert.dom('li.user-header p > small').hasText('Member since Feb 2022', 'date created matched');
    });
    test('it renders the global search in the navbar and a compact New icon', async function (assert) {
        await render(hbs`
            <AppLayouts::ApplicationHeader />
        `);
        assert.dom('nav.navbar .global-search').exists('the search is in the navbar');
        assert.dom('.create-module-btn .fa-plus').exists('the compact New icon is rendered');
    });
    test('it renders module icons before the quick create entries', async function (assert) {
        await render(hbs`
            <AppLayouts::ApplicationHeader />
        `);
        const links = this.element.querySelectorAll('.create-module-dropdown-content a');
        assert.strictEqual(links.length, 3, 'three entries');
        ['fa-tasks', 'fa-comments', 'fa-briefcase'].forEach((icon, idx) => {
            assert.ok(links[idx].firstElementChild.classList.contains(icon), `${icon} is the first child`);
        });
    });
});
module('Integration | Component | application-header search task', function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);

    hooks.beforeEach(function () {
        this.owner.register('service:acl', AclStub);
        this.owner.register('service:current-user', CurrentUserStub);
    });

    function serveSearch(server, { semantic = 'ok', snippet = null } = {}) {
        const searches = [];
        const project = server.create('project', { shortCode: 'aprom' });
        server.create('issue', { id: '1', subject: 'alpha one', issueNumber: 1, projectId: project.id });
        server.create('issue', { id: '2', subject: 'beta two', issueNumber: 2, projectId: project.id });
        server.get('/search', (schema, request) => {
            searches.push(request.queryParams);
            return {
                data: ['2', '1'].map((id) => ({
                    type: 'searchresult',
                    id: `issue:${id}`,
                    attributes: { module: 'issue', recordId: id, title: null, snippet, score: 1, matchedBy: ['fts'], pinned: false }
                })),
                meta: { query: request.queryParams.q, types: ['issue'], semantic }
            };
        });
        return searches;
    }

    test('typing twice within the debounce sends one search request for the second query', async function (assert) {
        const searches = serveSearch(this.server);

        await render(hbs`<AppLayouts::ApplicationHeader />`);
        await openSelect('.global-search');
        const first = typeInSelectSearch('alp');
        const second = typeInSelectSearch('beta');
        await Promise.all([first, second]);
        await settled();

        assert.strictEqual(searches.length, 1, 'exactly one search request');
        assert.deepEqual({ ...searches[0] }, { types: 'issue', q: 'beta', limit: '10' }, 'the request is for the second query');
    });

    test('a one-character query sends no search request', async function (assert) {
        const searches = serveSearch(this.server);

        await render(hbs`<AppLayouts::ApplicationHeader />`);
        await openSelect('.global-search');
        await typeInSelectSearch('a');
        await settled();

        assert.strictEqual(searches.length, 0, 'Gaia refuses queries under 2 characters');
    });

    test('settled() waits for a slow search response', async function (assert) {
        serveSearch(this.server);
        this.server.timing = 200;

        await render(hbs`<AppLayouts::ApplicationHeader />`);
        await openSelect('.global-search');
        await typeInSelectSearch('beta');
        await settled();

        assert.dom('[data-test-global-search-option]').exists({ count: 2 }, 'the results are there once settled');
    });

    test('options follow the search ranking and show the snippet matches as text', async function (assert) {
        serveSearch(this.server, { snippet: '&lt;b&gt;the <mark>beta</mark> page&lt;/b&gt;' });

        await render(hbs`<AppLayouts::ApplicationHeader />`);
        await openSelect('.global-search');
        await typeInSelectSearch('beta');
        await settled();

        const options = [...document.querySelectorAll('[data-test-global-search-option]')];
        assert.deepEqual(options.map((o) => o.dataset.testGlobalSearchOption), ['2', '1'], 'ranked as the search answered');
        const snippet = document.querySelector('[data-test-global-search-snippet]');
        assert.strictEqual(snippet.textContent.trim(), 'the beta page', 'record tags are dropped');
        assert.strictEqual(snippet.querySelector('mark').textContent, 'beta', 'the match is marked');
        assert.dom('[data-test-global-search-snippet] b').doesNotExist('record HTML is never rendered');
        assert.dom('.global-search-dropdown [data-test-global-search-snippet]').exists('the options sit in the scoped dropdown');
        assert.dom('[data-test-global-search-note]').doesNotExist('no note while semantic matching works');
    });

    test('says when matching by meaning is unavailable', async function (assert) {
        serveSearch(this.server, { semantic: 'unavailable' });

        await render(hbs`<AppLayouts::ApplicationHeader />`);
        await openSelect('.global-search');
        await typeInSelectSearch('beta');
        await settled();

        assert.dom('[data-test-global-search-note]').hasText('Matching by meaning is unavailable; showing word matches only.');
        assert.dom('.global-search-dropdown [data-test-global-search-note]').exists('the note sits in the scoped dropdown');
    });

    test('a failed search says so instead of no results', async function (assert) {
        this.server.get('/search', () => new Response(500, {}, { error: 'down' }));

        await render(hbs`<AppLayouts::ApplicationHeader />`);
        await openSelect('.global-search');
        await typeInSelectSearch('beta');
        await settled();

        assert.dom(noMatchesSelector()).hasText('Search failed. Try again.');
    });

    test('settled() waits for a slow failed search', async function (assert) {
        this.server.get('/search', () => new Response(500, {}, { error: 'down' }));
        this.server.timing = 200;

        await render(hbs`<AppLayouts::ApplicationHeader />`);
        await openSelect('.global-search');
        await typeInSelectSearch('beta');
        await settled();

        assert.dom(noMatchesSelector()).hasText('Search failed. Try again.');
    });
});

module('Integration | Component | application-header project switcher', function (hooks) {
    setupRenderingTest(hooks);

    hooks.beforeEach(function () {
        this.owner.register('service:acl', AclStub);
        this.owner.register('service:current-user', CurrentUserStub);
    });

    test('with no project selected the label is Select a project', async function (assert) {
        this.owner.lookup('service:tracked-project').setProjectId(null);
        await render(hbs`<AppLayouts::ApplicationHeader />`);
        assert.dom('[data-test-project-switcher]').includesText('Select a project');
    });

    test('the list ends with an All projects link', async function (assert) {
        this.owner.lookup('service:tracked-project').setProjectId(null);
        await render(hbs`<AppLayouts::ApplicationHeader />`);
        await openSelect('[data-test-project-switcher]');
        assert.dom('[data-test-project-switcher-all]').includesText('All projects');
    });
});
