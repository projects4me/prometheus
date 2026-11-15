/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import sources from 'prometheus/tests/helpers/component-contract-sources';
import { contractProblems, scriptUsage, templateUsage } from 'prometheus/tests/helpers/component-contract';

/** A manifest for the fixture component below; tests change one part of it. */
function fixtureManifest() {
	return {
		name: 'Fixture',
		component: 'fixture',
		doc: 'fixture.md',
		description: 'A fixture',
		arguments: {
			title: { type: 'string', required: true, description: 'The title' },
			items: { type: 'array', required: false, default: [], description: 'The items' },
		},
		events: {
			onPick: { payload: [{ name: 'id', type: 'string' }], description: 'A pick' },
		},
		blocks: {
			row: {
				description: 'One row',
				yields: [
					{ name: 'record', type: 'object' },
					{
						name: 'Cell',
						type: 'component',
						component: 'fixture/cell',
						curried: ['isActive'],
						arguments: { label: { type: 'string', required: false, description: 'The label' } },
						blocks: ['default'],
					},
				],
			},
			empty: { description: 'The empty state', yields: [] },
		},
	};
}

const fixtureSources = {
	fixture: {
		template: `{{!-- @commented is not an argument --}}
<div ...attributes>
  <Child @title={{@title}} />
  {{#each @items as |item|}}{{yield item (component "fixture/cell" isActive=true) to="row"}}{{/each}}
  {{#if (has-block "empty")}}{{yield to="empty"}}{{/if}}
</div>`,
		script: `/** @argument {Function} onIgnored mentioned in a comment only */
export default class Fixture { pick(id) { this.args.onPick?.(id); } }`,
	},
	'fixture/cell': {
		template: '<span class={{if @isActive "active"}}>{{@label}}{{yield}}</span>',
		script: null,
	},
};

module('Unit | Component contracts', function () {
	test('every manifest in public/ui-docs matches its component', function (assert) {
		let files = Object.keys(sources.manifests);
		assert.ok(files.includes('quick-list.json'), `manifests found: ${files.join(', ')}`);
		for (let file of files) {
			assert.deepEqual(contractProblems(file, sources.manifests[file], sources.components, sources.docs), [], file);
		}
	});

	test('it reads the arguments, blocks and yields of a template and a class', function (assert) {
		let usage = templateUsage(fixtureSources.fixture.template);
		assert.deepEqual([...usage.args].sort(), ['items', 'title'], 'arguments read, not passed or commented');
		assert.deepEqual([...usage.blocks].sort(), ['empty', 'row'], 'blocks from yield and has-block');
		assert.deepEqual(
			usage.yields.row,
			[[{ expression: 'item' }, { component: 'fixture/cell', curried: ['isActive'] }]],
			'yield parameters with the curried component',
		);
		assert.deepEqual([...scriptUsage(fixtureSources.fixture.script)], ['onPick'], 'this.args reads, not comments');
	});

	test('a matching manifest has no problems', function (assert) {
		assert.deepEqual(contractProblems('fixture.json', fixtureManifest(), fixtureSources, ['fixture.md']), []);
	});

	test('an argument used but not declared is reported', function (assert) {
		let manifest = fixtureManifest();
		delete manifest.arguments.items;
		assert.deepEqual(contractProblems('fixture.json', manifest, fixtureSources, ['fixture.md']), [
			'fixture.json (fixture) uses @items but the manifest does not declare it',
		]);
	});

	test('an argument declared but not used is reported', function (assert) {
		let manifest = fixtureManifest();
		manifest.events.onRemoved = { payload: [], description: 'Gone' };
		assert.deepEqual(contractProblems('fixture.json', manifest, fixtureSources, ['fixture.md']), [
			'fixture.json (fixture) declares @onRemoved but does not use it',
		]);
	});

	test('blocks and yields that differ from the template are reported', function (assert) {
		let manifest = fixtureManifest();
		delete manifest.blocks.empty;
		manifest.blocks.footer = { description: 'Footer', yields: [] };
		manifest.blocks.row.yields[1].curried = [];
		manifest.blocks.row.yields[1].blocks = ['default', 'extra'];
		assert.deepEqual(contractProblems('fixture.json', manifest, fixtureSources, ['fixture.md']), [
			'fixture.json (fixture) block uses empty but the manifest does not declare it',
			'fixture.json (fixture) block declares footer but does not use it',
			'fixture.json (fixture) block row curries isActive, the manifest says nothing',
			'fixture/cell uses @isActive but the manifest does not declare it',
			'fixture/cell blocks: declares extra but does not use it',
		]);
	});

	test('a malformed manifest is reported without comparing', function (assert) {
		let manifest = fixtureManifest();
		manifest.arguments.title.default = 'x';
		delete manifest.blocks;
		assert.deepEqual(contractProblems('fixture.json', manifest, fixtureSources, ['fixture.md']), [
			'fixture.json: "blocks" must be an object keyed by name',
			'fixture.json: argument @title is required and has a default',
		]);
	});
});
