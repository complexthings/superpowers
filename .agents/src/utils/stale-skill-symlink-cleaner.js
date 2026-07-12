/**
 * Reconcile retired repo-managed skill symlinks.
 *
 * Ownership is proved from the symlink's raw target, never target resolution:
 * it must lexically sit under this installed package's bundled skills tree and
 * end in an explicitly retired skill name.
 */

import { existsSync, lstatSync, readdirSync, readlinkSync, unlinkSync } from 'fs';
import { basename, join, resolve, sep } from 'path';
import { paths } from '../core/paths.js';

export const RETIRED_SKILL_NAMES = new Set([
  'preserving-productive-tensions',
  'dispatching-parallel-agents',
  'executing-plans',
  'finishing-a-development-branch',
  'receiving-code-review',
  'requesting-code-review',
  'subagent-driven-development',
  'using-git-worktrees',
  'writing-plans',
  'defense-in-depth',
  'root-cause-tracing',
  'systematic-debugging',
  'verification-before-completion',
  'finding-skills',
  'create-agents-md',
  'creating-prompts',
  'using-superpowers',
  'writing-prompts',
  'collision-zone-thinking',
  'inversion-exercise',
  'meta-pattern-recognition',
  'scale-game',
  'simplification-cascades',
  'when-stuck',
  'tracing-knowledge-lineages',
  'condition-based-waiting',
  'test-driven-development',
  'testing-anti-patterns',
  'using-a-skill',
]);

const isDescendantOf = (childPath, parentPath) =>
  childPath === parentPath || childPath.startsWith(`${parentPath}${sep}`);

/**
 * Delete only retired links that prove package ownership from their raw target.
 *
 * @returns {{ removed: string[], skipped: number }}
 */
export const reconcileRetiredSkillSymlinks = ({
  skillDir,
  bundledSkillsDir,
  retiredSkillNames = RETIRED_SKILL_NAMES,
}) => {
  const removed = [];
  let skipped = 0;
  const bundledRoot = resolve(bundledSkillsDir);

  if (!existsSync(skillDir)) return { removed, skipped };

  let entries;
  try {
    entries = readdirSync(skillDir);
  } catch {
    return { removed, skipped };
  }

  for (const name of entries) {
    const linkPath = join(skillDir, name);

    try {
      if (!lstatSync(linkPath).isSymbolicLink()) continue;

      const target = resolve(skillDir, readlinkSync(linkPath));
      if (!isDescendantOf(target, bundledRoot) || !retiredSkillNames.has(basename(target))) {
        skipped++;
        continue;
      }

      unlinkSync(linkPath);
      removed.push(linkPath);
    } catch {
      skipped++;
    }
  }

  return { removed, skipped };
};

/**
 * Run reconciliation for every dir bootstrap populates with repo-managed links
 * (~/.agents/skills and ~/.claude/skills). Ownership is proved per-link from the
 * raw target, so only this package's retired links are removed — a user's own
 * skills in those dirs are never touched.
 */
export const runStaleSkillSymlinkCleaner = () => {
  const dirs = [paths.homePersonalSkills, paths.homeClaudeSkills];
  const removed = [];
  let skipped = 0;
  for (const skillDir of dirs) {
    const result = reconcileRetiredSkillSymlinks({
      skillDir,
      bundledSkillsDir: paths.homeSuperpowersSkills,
    });
    removed.push(...result.removed);
    skipped += result.skipped;
  }
  return { removed, skipped };
};
