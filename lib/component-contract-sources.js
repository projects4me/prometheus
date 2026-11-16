'use strict';

/**
 * Broccoli plugin for the tests tree: bundles the component contract manifests
 * (public/ui-docs/*.json) with the source of the components they describe into the test module
 * `prometheus/tests/helpers/component-contract-sources`, so the contract unit test can compare
 * them in the browser. Only the components a manifest names (its own component and the components
 * it yields) are bundled; nothing of this reaches the app bundle.
 *
 * Export: `{ manifests: { 'quick-list.json': {...} }, components: { 'quick-list': { template, script } },
 *   docs: ['quick-list.md', ...] }`;
 * `template` and `script` are the source text, or null when the file does not exist.
 */
const fs = require('fs');
const path = require('path');
const BroccoliPlugin = require('broccoli-plugin');

/** The `.hbs`/`.js` source of a component path (`quick-list/item`), flat or as a folder `index`. */
function readComponent(dir, componentPath) {
    const read = (ext) => {
        for (const file of [`${componentPath}${ext}`, `${componentPath}/index${ext}`]) {
            const full = path.join(dir, file);
            if (fs.existsSync(full)) {
                return fs.readFileSync(full, 'utf8');
            }
        }
        return null;
    };
    return { template: read('.hbs'), script: read('.js') };
}

/** The component paths a manifest names: its own and the ones its blocks yield. */
function componentPaths(manifest) {
    const paths = [manifest.component];
    for (const block of Object.values(manifest.blocks ?? {})) {
        for (const value of block.yields ?? []) {
            if (value.component) {
                paths.push(value.component);
            }
        }
    }
    return paths.filter((p) => typeof p === 'string');
}

module.exports = class ComponentContractSources extends BroccoliPlugin {
    /**
     * @param {string} docsDir the ui-docs folder with the manifests
     * @param {string} componentsDir app/components
     */
    constructor(docsDir, componentsDir) {
        super([docsDir, componentsDir], { annotation: 'component contract sources', persistentOutput: false });
    }

    build() {
        const [docsDir, componentsDir] = this.inputPaths;
        const manifests = {};
        const components = {};
        const files = fs.readdirSync(docsDir).sort();
        const docs = files.filter((f) => f.endsWith('.md'));
        for (const file of files.filter((f) => f.endsWith('.json'))) {
            let manifest;
            try {
                manifest = JSON.parse(fs.readFileSync(path.join(docsDir, file), 'utf8'));
            } catch (error) {
                // Keep the build going; the unit test reports the broken manifest.
                manifests[file] = { parseError: error.message };
                continue;
            }
            manifests[file] = manifest;
            for (const componentPath of componentPaths(manifest)) {
                components[componentPath] ??= readComponent(componentsDir, componentPath);
            }
        }
        const outDir = path.join(this.outputPath, 'helpers');
        fs.mkdirSync(outDir, { recursive: true });
        fs.writeFileSync(
            path.join(outDir, 'component-contract-sources.js'),
            `export default ${JSON.stringify({ manifests, components, docs })};\n`
        );
    }
};
