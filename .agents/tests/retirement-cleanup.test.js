/**
 * Real-filesystem coverage for the Retirement Cleanup routine.
 *
 * Test list:
 * - settings.json keeps unrelated SessionStart hooks, ours is dropped
 * - a user-authored skill symlink survives, a package-owned one is removed
 * - a real file (the copilot hook) lands in the retirement backup directory
 * - the AGENTS.md managed region becomes the retirement note, user text intact
 * - one failing artifact is reported without aborting the rest of the run
 */

import { describe, test, expect, afterEach } from 'bun:test';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { runRetirementCleanup } from '../src/commands/retirement-cleanup.js';

const roots = [];
const makeRoot = () => {
  const root = mkdtempSync(join(tmpdir(), 'retirement-cleanup-'));
  roots.push(root);
  return root;
};

afterEach(() => {
  while (roots.length) rmSync(roots.pop(), { recursive: true, force: true });
});

/** Build a home/project pair plus the options runRetirementCleanup needs. */
const setup = () => {
  const root = makeRoot();
  const home = join(root, 'home');
  const projectRoot = join(root, 'project');
  const bundledSkillsDir = join(home, '.agents', 'superpowers', 'skills');
  mkdirSync(bundledSkillsDir, { recursive: true });
  mkdirSync(projectRoot, { recursive: true });
  return {
    root,
    home,
    projectRoot,
    bundledSkillsDir,
    opts: {
      home,
      projectRoot,
      bundledSkillsDir,
      backupDir: join(home, '.agents', 'retirement-backup-test'),
      settingsPath: join(home, '.claude', 'settings.json'),
      copilotHooksDir: join(home, '.copilot', 'hooks'),
      agentsMdPath: join(home, '.agents', 'AGENTS.md'),
    },
  };
};

const write = (path, content) => {
  mkdirSync(join(path, '..'), { recursive: true });
  writeFileSync(path, content, 'utf8');
};

describe('runRetirementCleanup', () => {
  test('drops our SessionStart hook and keeps unrelated hooks', () => {
    const { opts } = setup();
    write(opts.settingsPath, JSON.stringify({
      model: 'opus',
      hooks: {
        SessionStart: [
          { matcher: 'startup', hooks: [{ type: 'command', command: 'echo mine' }] },
          { matcher: 'startup', hooks: [{ type: 'command', command: 'superpowers-agent session-context --format=claude' }] },
        ],
      },
    }, null, 2));

    runRetirementCleanup(opts);

    const settings = JSON.parse(readFileSync(opts.settingsPath, 'utf8'));
    expect(settings.model).toBe('opus');
    expect(settings.hooks.SessionStart).toHaveLength(1);
    expect(JSON.stringify(settings)).not.toContain('superpowers-agent session-context');
  });

  test('removes a package-owned skill symlink and leaves a user-authored one', () => {
    const { home, bundledSkillsDir, opts } = setup();
    const skillDir = join(home, '.claude', 'skills');
    mkdirSync(skillDir, { recursive: true });
    const ownedTarget = join(bundledSkillsDir, 'brainstorming');
    mkdirSync(ownedTarget, { recursive: true });
    const userTarget = join(home, 'my-skills', 'my-own');
    mkdirSync(userTarget, { recursive: true });

    const owned = join(skillDir, 'brainstorming');
    const mine = join(skillDir, 'my-own');
    symlinkSync(ownedTarget, owned);
    symlinkSync(userTarget, mine);

    runRetirementCleanup(opts);

    expect(existsSync(owned)).toBe(false);
    expect(existsSync(mine)).toBe(true);
  });

  test('moves a real file into the retirement backup directory', () => {
    const { opts } = setup();
    const hookPath = join(opts.copilotHooksDir, 'superpowers.json');
    write(hookPath, '{"version":1}');

    const result = runRetirementCleanup(opts);

    expect(existsSync(hookPath)).toBe(false);
    expect(readFileSync(join(opts.backupDir, 'superpowers.json'), 'utf8')).toBe('{"version":1}');
    expect(result.backupDir).toBe(opts.backupDir);
  });

  test('rewrites the managed AGENTS.md region and keeps user content', () => {
    const { opts } = setup();
    write(opts.agentsMdPath, [
      '# My notes',
      '<!-- SUPERPOWERS_SKILLS_START -->',
      'managed instructions',
      '<!-- SUPERPOWERS_SKILLS_END -->',
      'my own paragraph',
    ].join('\n'));

    runRetirementCleanup(opts);

    const content = readFileSync(opts.agentsMdPath, 'utf8');
    expect(content).toContain('# My notes');
    expect(content).toContain('my own paragraph');
    expect(content).toContain('https://skills.sh');
    expect(content).not.toContain('managed instructions');
  });

  test('reports a failing artifact without aborting the run', () => {
    const { opts } = setup();
    // Unparseable settings.json makes exactly one artifact throw.
    write(opts.settingsPath, '{ not json');
    const hookPath = join(opts.copilotHooksDir, 'superpowers.json');
    write(hookPath, '{"version":1}');

    const result = runRetirementCleanup(opts);

    expect(result.failed).toHaveLength(1);
    expect(result.failed[0].artifact).toBe('claude-session-hook');
    expect(existsSync(hookPath)).toBe(false);
  });
});
