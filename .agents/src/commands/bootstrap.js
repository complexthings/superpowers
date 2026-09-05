/**
 * Command: bootstrap
 *
 * Superpowers is retired. `bootstrap` no longer installs anything — it removes
 * every artifact the package ever installed and points at the replacement.
 */

import { runRetirementCleanup, printCleanupSummary } from './retirement-cleanup.js';

const runBootstrap = () => {
    printCleanupSummary(runRetirementCleanup());
};

export { runBootstrap };
