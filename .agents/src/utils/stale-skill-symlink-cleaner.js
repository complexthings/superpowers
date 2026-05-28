/**
 * Stale platform-skill-symlink cleaner (issue #7, Part B)
 *
 * Iterates over a given list of platform skill directories and removes an entry
 * ONLY IF ALL of the following hold:
 *   1. The entry is a symlink.
 *   2. Its resolved target lives inside one of the provided managed skill roots.
 *   3. The resolved target directory contains a `skill.json` file.
 *
 * Agent-persona symlinks are never touched — this module is only ever passed
 * *skills* directories in its scan list, never *agents* directories.
 *
 * The core logic accepts parameters so tests can inject temp directories
 * without touching the real home directory. A thin wrapper (runStaleSkillSymlinkCleaner)
 * supplies the real defaults for production use.
 */

import {
  existsSync,
  readdirSync,
  lstatSync,
  unlinkSync,
  realpathSync,
} from 'fs';
import { join } from 'path';
import { homedir } from 'os';

/**
 * Resolve real path of a directory; returns the original path on failure
 * (so callers that don't exist yet just get the original path back).
 */
const safeRealpathDir = (p) => {
  try {
    return realpathSync(p);
  } catch {
    return p;
  }
};

// ─── helpers ──────────────────────────────────────────────────────────────────

/**
 * Return true if `p` is a symlink; never throws.
 */
const isSymlink = (p) => {
  try {
    return lstatSync(p).isSymbolicLink();
  } catch {
    return false;
  }
};

/**
 * Resolve the real path of a symlink target; returns null on any error
 * (covers broken/dangling symlinks).
 */
const safeRealpath = (p) => {
  try {
    return realpathSync(p);
  } catch {
    return null;
  }
};

/**
 * Return true if `childPath` starts with `parentPath` (with a separator guard
 * so "/foo/bar" is a child of "/foo" but "/foobar" is not).
 */
const isDescendantOf = (childPath, parentPath) => {
  const normalParent = parentPath.endsWith('/') ? parentPath : parentPath + '/';
  return childPath.startsWith(normalParent) || childPath === parentPath;
};

/**
 * Return true if `targetPath` lives inside any of the `managedSkillRoots`.
 */
const isInManagedRoot = (targetPath, managedSkillRoots) =>
  managedSkillRoots.some((root) => isDescendantOf(targetPath, root));

/**
 * Return true if the resolved target directory contains a `skill.json` file.
 */
const hasSkillJson = (resolvedTarget) => {
  try {
    return existsSync(join(resolvedTarget, 'skill.json'));
  } catch {
    return false;
  }
};

// ─── core cleaner ─────────────────────────────────────────────────────────────

/**
 * Scan the given platform skill directories and remove stale skill symlinks.
 *
 * @param {Object} options
 * @param {string[]} options.platformDirs       - List of skill dirs to scan.
 * @param {string[]} options.managedSkillRoots  - Managed skill roots (e.g. ~/.agents/skills).
 *
 * @returns {{ removed: string[], skipped: number }}
 *   - removed: absolute paths of symlinks that were deleted.
 *   - skipped: count of symlinks examined but not removed (gated out).
 */
export const cleanStaleSkillSymlinks = ({ platformDirs, managedSkillRoots }) => {
  const removed = [];
  let skipped = 0;

  // Resolve managed roots to their real paths so macOS /tmp → /private/tmp
  // comparison works correctly.
  const resolvedRoots = managedSkillRoots.map(safeRealpathDir);

  for (const dir of platformDirs) {
    // Be a no-op when directory doesn't exist
    if (!existsSync(dir)) continue;

    let entries;
    try {
      entries = readdirSync(dir);
    } catch {
      continue;
    }

    for (const name of entries) {
      const entryPath = join(dir, name);

      // Gate 1: must be a symlink; ignore regular files/dirs
      if (!isSymlink(entryPath)) continue;

      // Resolve the real target (handles dangling symlinks gracefully)
      const realTarget = safeRealpath(entryPath);

      // Gate 2: resolved target must live inside a managed skill root.
      // Dangling symlinks (realTarget === null) are NOT in any root → skip.
      if (!realTarget || !isInManagedRoot(realTarget, resolvedRoots)) {
        skipped++;
        continue;
      }

      // Gate 3: resolved target directory must contain skill.json
      if (!hasSkillJson(realTarget)) {
        skipped++;
        continue;
      }

      // All three gates passed — remove the stale symlink
      try {
        unlinkSync(entryPath);
        removed.push(entryPath);
      } catch {
        // Silently tolerate removal failures (e.g., permission errors)
        skipped++;
      }
    }
  }

  return { removed, skipped };
};

// ─── production wrapper ───────────────────────────────────────────────────────

/**
 * The canonical list of platform skill directories to scan.
 * Includes current platforms AND deprecated ones (cursor, codex, gemini)
 * so that migrating users get cleaned up.
 *
 * @param {string} [projectRoot] - Optional project root for project-local dirs.
 * @returns {string[]}
 */
export const getDefaultPlatformDirs = (projectRoot) => {
  const home = homedir();
  const global = [
    join(home, '.claude', 'skills'),
    join(home, '.copilot', 'skills'),
    join(home, '.config', 'opencode', 'skill'),
    join(home, '.cursor', 'skills'),
    join(home, '.gemini', 'skills'),
    join(home, '.codex', 'skills'),
  ];

  if (!projectRoot) return global;

  const local = [
    join(projectRoot, '.claude', 'skills'),
    join(projectRoot, '.github', 'skills'),
    join(projectRoot, '.opencode', 'skill'),
    join(projectRoot, '.cursor', 'skills'),
    join(projectRoot, '.gemini', 'skills'),
    join(projectRoot, '.codex', 'skills'),
  ];

  return [...global, ...local];
};

/**
 * Run the stale-symlink cleaner with real home-directory defaults.
 *
 * @param {Object} [options]
 * @param {string} [options.projectRoot] - If provided, also scans project-local dirs.
 * @returns {{ removed: string[], skipped: number }}
 */
export const runStaleSkillSymlinkCleaner = (options = {}) => {
  const home = homedir();
  const managedSkillRoots = [
    join(home, '.agents', 'skills'),
    ...(options.projectRoot
      ? [join(options.projectRoot, '.agents', 'skills')]
      : []),
  ];

  const platformDirs = getDefaultPlatformDirs(options.projectRoot);

  return cleanStaleSkillSymlinks({ platformDirs, managedSkillRoots });
};
