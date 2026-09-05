/**
 * Retirement Cleanup.
 *
 * Removes every artifact this package installs. Real files are moved into
 * ~/.agents/retirement-backup-<date>/ before they leave their install site;
 * symlinks are removed outright. Any single artifact failing is recorded and
 * skipped — cleanup never aborts halfway.
 */

import {
  copyFileSync,
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  renameSync,
  unlinkSync,
  writeFileSync,
} from 'fs';
import { basename, join } from 'path';
import { paths } from '../core/paths.js';
import { reconcileRetiredSkillSymlinks } from '../utils/stale-skill-symlink-cleaner.js';

// Same marker claude.js installs by, so we remove exactly our own hook entry.
const HOOK_COMMAND_MARKER = 'superpowers-agent session-context';
const AGENTS_START_MARKER = '<!-- SUPERPOWERS_SKILLS_START -->';
const AGENTS_END_MARKER = '<!-- SUPERPOWERS_SKILLS_END -->';
const RETIREMENT_NOTE = 'Superpowers is retired; this section no longer manages anything.\nSee https://skills.sh for what replaced it.';

// Retirement removes every package-owned skill symlink, not just the retired
// names — ownership is still proved from the raw target by the cleaner.
const ANY_SKILL_NAME = { has: () => true };

const today = () => new Date().toISOString().split('T')[0];

const isSymlink = (path) => {
  try {
    return lstatSync(path).isSymbolicLink();
  } catch {
    return false;
  }
};

/** Move a real file into the backup dir, creating the dir on first use. */
const moveToBackup = (filePath, backupDir) => {
  if (!existsSync(backupDir)) mkdirSync(backupDir, { recursive: true });
  const dest = join(backupDir, basename(filePath));
  try {
    renameSync(filePath, dest);
  } catch {
    // Different filesystem: copy then remove.
    copyFileSync(filePath, dest);
    unlinkSync(filePath);
  }
  return dest;
};

/** Remove a symlink, or back up and remove a real file. Returns a report entry. */
const removePath = (artifact, targetPath, backupDir) => {
  if (isSymlink(targetPath)) {
    unlinkSync(targetPath);
    return { artifact, path: targetPath, action: 'removed-symlink' };
  }
  if (!existsSync(targetPath)) return { artifact, path: targetPath, action: 'absent' };
  const backup = moveToBackup(targetPath, backupDir);
  return { artifact, path: targetPath, action: 'backed-up', backup };
};

/** Drop our SessionStart entry from settings.json, preserving every other hook. */
const removeClaudeSessionHook = (settingsPath, backupDir) => {
  if (!existsSync(settingsPath)) {
    return { artifact: 'claude-session-hook', path: settingsPath, action: 'absent' };
  }

  const raw = readFileSync(settingsPath, 'utf8');
  const settings = raw.trim() ? JSON.parse(raw) : {};
  const entries = Array.isArray(settings?.hooks?.SessionStart) ? settings.hooks.SessionStart : [];
  const isOurs = (entry) => {
    try {
      return JSON.stringify(entry).includes(HOOK_COMMAND_MARKER);
    } catch {
      return false;
    }
  };

  if (!entries.some(isOurs)) {
    return { artifact: 'claude-session-hook', path: settingsPath, action: 'absent' };
  }

  // Same backup shape installClaudeSessionHook writes before it edits.
  const backup = `${settingsPath}.backup-${today()}`;
  copyFileSync(settingsPath, backup);

  const preserved = entries.filter((e) => !isOurs(e));
  if (preserved.length) settings.hooks.SessionStart = preserved;
  else delete settings.hooks.SessionStart;

  writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + '\n', 'utf8');
  return { artifact: 'claude-session-hook', path: settingsPath, action: 'removed', backup };
};

/** Rewrite our managed AGENTS.md region to a retirement note, leaving user content. */
const retireAgentsMdRegion = (agentsMdPath, backupDir) => {
  if (!existsSync(agentsMdPath)) {
    return { artifact: 'agents-md', path: agentsMdPath, action: 'absent' };
  }
  const content = readFileSync(agentsMdPath, 'utf8');
  if (!content.includes(AGENTS_START_MARKER) || !content.includes(AGENTS_END_MARKER)) {
    return { artifact: 'agents-md', path: agentsMdPath, action: 'absent' };
  }

  if (!existsSync(backupDir)) mkdirSync(backupDir, { recursive: true });
  const backup = join(backupDir, basename(agentsMdPath));
  copyFileSync(agentsMdPath, backup);

  const region = new RegExp(`${AGENTS_START_MARKER}[\\s\\S]*?${AGENTS_END_MARKER}`, 'g');
  const rewritten = content.replace(
    region,
    `${AGENTS_START_MARKER}\n${RETIREMENT_NOTE}\n${AGENTS_END_MARKER}`,
  );
  writeFileSync(agentsMdPath, rewritten, 'utf8');
  return { artifact: 'agents-md', path: agentsMdPath, action: 'rewritten', backup };
};

/**
 * Run the whole cleanup. Every path is overridable so tests can point it at
 * temp directories.
 *
 * @returns {{ backupDir: string, handled: object[], failed: object[] }}
 */
export const runRetirementCleanup = ({
  home = paths.home,
  projectRoot = paths.projectRoot,
  backupDir = join(home, '.agents', `retirement-backup-${today()}`),
  settingsPath = join(home, '.claude', 'settings.json'),
  copilotHooksDir = paths.copilotHooksDir,
  bundledSkillsDir = paths.homeSuperpowersSkills,
  agentsMdPath = join(home, '.agents', 'AGENTS.md'),
} = {}) => {
  const skillDirs = [
    join(home, '.agents', 'skills'),
    join(home, '.claude', 'skills'),
    join(home, '.copilot', 'skills'),
    join(home, '.config', 'opencode', 'skill'),
    join(projectRoot, '.claude', 'skills'),
    join(projectRoot, '.copilot', 'skills'),
    join(projectRoot, '.opencode', 'skill'),
  ];

  const steps = [
    ['claude-session-hook', () => removeClaudeSessionHook(settingsPath, backupDir)],
    ['copilot-session-hook', () => removePath('copilot-session-hook', join(copilotHooksDir, 'superpowers.json'), backupDir)],
    ['opencode-plugin', () => removePath(
      'opencode-plugin',
      join(home, '.config', 'opencode', 'plugins', 'superpowers-agent.js'),
      backupDir,
    )],
    ...skillDirs.map((skillDir) => ['skill-symlinks', () => {
      const { removed, skipped } = reconcileRetiredSkillSymlinks({
        skillDir,
        bundledSkillsDir,
        retiredSkillNames: ANY_SKILL_NAME,
      });
      return { artifact: 'skill-symlinks', path: skillDir, action: 'removed-symlink', removed, skipped };
    }]),
    ['shim', () => removePath('shim', join(home, '.local', 'bin', 'superpowers'), backupDir)],
    ['shim', () => removePath('shim', join(home, '.local', 'bin', 'superpowers-agent'), backupDir)],
    ['agents-md', () => retireAgentsMdRegion(agentsMdPath, backupDir)],
  ];

  const handled = [];
  const failed = [];
  for (const [artifact, step] of steps) {
    try {
      handled.push(step());
    } catch (error) {
      failed.push({ artifact, action: 'failed', message: error.message });
    }
  }

  return { backupDir, handled, failed };
};

/** One-line retirement notice. stderr, so stdout stays a clean contract. */
export const printRetirementBanner = () => {
  console.error('Superpowers is retired — see https://skills.sh for what replaced it.');
};

/** Print what the cleanup did, where the backup went, and how to restore it. */
export const printCleanupSummary = ({ backupDir, handled, failed }) => {
  const changed = handled.filter((entry) => entry.action !== 'absent');
  console.log(`Retirement cleanup: ${changed.length} artifact(s) removed, ${failed.length} failed.`);
  for (const entry of changed) {
    console.log(`  ${entry.action}: ${entry.artifact}${entry.path ? ` (${entry.path})` : ''}`);
  }
  for (const entry of failed) {
    console.log(`  failed: ${entry.artifact} — ${entry.message}`);
  }

  console.log(`\nBackup: ${backupDir}`);
  const restorable = changed.filter((entry) => entry.backup);
  if (restorable.length) {
    console.log('Restore with:');
    for (const entry of restorable) console.log(`  cp "${entry.backup}" "${entry.path}"`);
  }

  console.log('\nSkills now live at https://skills.sh — try: npx skills');
};
