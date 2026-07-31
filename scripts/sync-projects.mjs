import { cp, mkdir, rm, stat, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sources = {
  abc: resolve(process.env.ABC_SOURCE || root, process.env.ABC_SOURCE ? '' : '../abc'),
  opensnipping: resolve(process.env.OPENSNIPPING_SOURCE || root, process.env.OPENSNIPPING_SOURCE ? '' : '../opensnipping-web'),
};

const projects = [
  {
    name: 'abc',
    source: sources.abc,
    destination: resolve(root, 'public/projects/abc/demo'),
    files: ['public/index.html', 'public/style.css', 'public/game.js', 'public/manifest.json'],
    strip: 'public/',
  },
  {
    name: 'opensnipping',
    source: sources.opensnipping,
    destination: resolve(root, 'public/projects/opensnipping/demo'),
    files: ['index.html', 'manifest.json', 'src/app.js', 'src/style.css', 'src/assets', 'src/lib'],
    strip: '',
  },
];

function git(source, ...args) {
  return execFileSync('git', ['-C', source, ...args], { encoding: 'utf8' }).trim();
}

async function assertExists(path) {
  try { await stat(path); } catch { throw new Error(`Required project file is missing: ${path}`); }
}

async function copyProject(project) {
  await assertExists(resolve(project.source, '.git'));
  const dirty = git(project.source, 'status', '--porcelain');
  if (dirty) throw new Error(`${project.name} has uncommitted changes; commit or stash them before syncing.`);

  await rm(project.destination, { recursive: true, force: true });
  await mkdir(project.destination, { recursive: true });

  for (const relative of project.files) {
    const source = resolve(project.source, relative);
    await assertExists(source);
    const outputRelative = project.strip && relative.startsWith(project.strip)
      ? relative.slice(project.strip.length)
      : relative;
    const destination = resolve(project.destination, outputRelative);
    await mkdir(dirname(destination), { recursive: true });
    await cp(source, destination, { recursive: true });
  }

  return {
    repository: git(project.source, 'config', '--get', 'remote.origin.url'),
    commit: git(project.source, 'rev-parse', 'HEAD'),
    syncedAt: new Date().toISOString(),
  };
}

const provenance = {};
for (const project of projects) {
  provenance[project.name] = await copyProject(project);
  console.log(`✓ Synced ${project.name} at ${provenance[project.name].commit.slice(0, 7)}`);
}

await writeFile(
  resolve(root, 'src/data/project-sources.json'),
  `${JSON.stringify(provenance, null, 2)}\n`,
);

// Guard against accidental credential copies even if an allowlist changes later.
for (const forbidden of ['.env', '.env.lan', '.git', 'deploy-prod.sh', 'deploy-public.sh']) {
  const output = execFileSync('find', [resolve(root, 'public/projects'), '-name', forbidden, '-print'], { encoding: 'utf8' }).trim();
  if (output) throw new Error(`Forbidden deployment file copied: ${output}`);
}

console.log('✓ Project snapshots contain only allowlisted runtime files.');
