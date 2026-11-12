import { registerDeprecationHandler } from '@ember/debug';

// Deprecation IDs hidden in test output. Add more, one at a time, as they are handled.
export const HIDDEN_DEPRECATION_IDS = [];

export function createDeprecationCounter(hiddenIds = HIDDEN_DEPRECATION_IDS) {
  const counts = {};

  function handler(message, options, next) {
    const id = (options && options.id) || 'unknown';
    counts[id] = (counts[id] || 0) + 1;
    if (hiddenIds.includes(id)) {
      return;
    }
    next(message, options);
  }

  return { counts, handler };
}

export function reportDeprecations(counts, log = console.log) {
  Object.keys(counts)
    .sort()
    .forEach((id) => log(`DEPRECATIONS ${id}: ${counts[id]}`));
}

export function setupDeprecationReporting(QUnit) {
  const { counts, handler } = createDeprecationCounter();
  registerDeprecationHandler(handler);
  QUnit.done(() => reportDeprecations(counts));
}
