'use strict';

/**
 * Broccoli plugin: turns translations/*.json into the app module
 * `prometheus/utils/intl/bundled-translations`, exporting
 * `[[locale, translations], ...]`. Rebuilds when a translation file changes.
 */
const fs = require('fs');
const path = require('path');
const Plugin = require('broccoli-plugin');

module.exports = class BundledTranslations extends Plugin {
    constructor(inputNode) {
        super([inputNode], { annotation: 'bundled translations', persistentOutput: false });
    }

    build() {
        const dir = this.inputPaths[0];
        const entries = fs
            .readdirSync(dir)
            .filter((file) => file.endsWith('.json'))
            .sort()
            .map((file) => [
                path.basename(file, '.json').toLowerCase(),
                JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8')),
            ]);
        const outDir = path.join(this.outputPath, 'utils', 'intl');
        fs.mkdirSync(outDir, { recursive: true });
        fs.writeFileSync(
            path.join(outDir, 'bundled-translations.js'),
            `export default ${JSON.stringify(entries)};\n`
        );
    }
};
