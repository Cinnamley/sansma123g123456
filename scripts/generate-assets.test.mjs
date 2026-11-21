import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  THEMES,
  buildHeroSvg,
  buildPipelineSvg,
  contrastRatio,
  escapeXml,
  projectIso,
} from './generate-assets.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = resolve(__dirname, '..');

test('projectIso computes symmetric orthographic isometric coordinates', () => {
  const origin = projectIso(0, 0, 0, 100, 100);
  assert.deepEqual(origin, { x: 100, y: 100 });

  const up = projectIso(0, 50, 0, 100, 100);
  assert.deepEqual(up, { x: 100, y: 50 });

  const posX = projectIso(10, 0, 0, 0, 0);
  const posZ = projectIso(0, 0, 10, 0, 0);
  assert.equal(posX.x, -posZ.x);
  assert.equal(posX.y, posZ.y);
});

test('escapeXml encodes special XML characters cleanly', () => {
  assert.equal(escapeXml('A & B <C> "D"'), 'A &amp; B &lt;C&gt; &quot;D&quot;');
});

test('dark and light themes satisfy WCAG AA contrast ratios for text', () => {
  for (const mode of ['dark', 'light']) {
    const t = THEMES[mode];
    assert.ok(
      contrastRatio(t.textPrimary, t.surface) >= 10,
      `${mode} primary ink must exceed 10:1`
    );
    assert.ok(
      contrastRatio(t.textSecondary, t.surface) >= 4.5,
      `${mode} secondary ink must pass WCAG AA (4.5:1)`
    );
    assert.ok(
      contrastRatio(t.textMuted, t.cardSurface) >= 4.5,
      `${mode} muted ink must pass WCAG AA (4.5:1)`
    );
    assert.ok(
      contrastRatio(t.accent, t.surface) >= 4.5,
      `${mode} accent must pass WCAG AA (4.5:1) against surface`
    );
  }
});

test('generated hero and pipeline SVGs are well-formed and keep axis labels inside viewBox', () => {
  for (const mode of ['dark', 'light']) {
    const hero = buildHeroSvg(mode);
    assert.match(hero, /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" width="900" height="280" viewBox="0 0 900 280"/);
    assert.match(hero, /<\/svg>\s*$/);
    assert.ok(!/&(?!amp;|lt;|gt;|quot;|apos;)/.test(hero), `Unescaped ampersand in hero-${mode}`);

    // Verify Y axis label stays well inside the top border (y >= 16)
    const yLabelMatch = hero.match(/<text x="[^"]+" y="([^"]+)">Y<\/text>/);
    assert.ok(yLabelMatch, `Missing Y axis label in hero-${mode}`);
    assert.ok(Number(yLabelMatch[1]) >= 16, `Y axis label too close to top edge: y=${yLabelMatch[1]}`);

    const pipeline = buildPipelineSvg(mode);
    assert.match(pipeline, /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" width="900" height="126" viewBox="0 0 900 126"/);
    assert.match(pipeline, /<\/svg>\s*$/);
    assert.ok(!/&(?!amp;|lt;|gt;|quot;|apos;)/.test(pipeline), `Unescaped ampersand in pipeline-${mode}`);
  }
});

test('README references only existing local SVG assets and contains zero AI-slop widgets', () => {
  const readme = readFileSync(resolve(ROOT_DIR, 'README.md'), 'utf8');

  const bannedHosts = [
    'capsule-render.vercel.app',
    'readme-typing-svg.herokuapp.com',
    'komarev.com',
    'img.shields.io',
    'github-readme-stats.vercel.app',
    'streak-stats.demolab.com',
  ];
  for (const host of bannedHosts) {
    assert.ok(!readme.includes(host), `README must not contain AI-slop host: ${host}`);
  }

  const assetRefs = [...readme.matchAll(/(?:srcset|src)="(assets\/[^"]+)"/g)].map((m) => m[1]);
  assert.ok(assetRefs.length >= 6, 'README should include dark, light, and fallback references for hero and pipeline');

  for (const relPath of assetRefs) {
    assert.ok(existsSync(resolve(ROOT_DIR, relPath)), `Referenced asset missing on disk: ${relPath}`);
  }

  const pictureBlocks = readme.match(/<picture>[\s\S]*?<\/picture>/g) ?? [];
  assert.equal(pictureBlocks.length, 2, 'README should contain 2 dual-theme <picture> blocks');
  for (const block of pictureBlocks) {
    assert.match(block, /prefers-color-scheme: dark/);
    assert.match(block, /prefers-color-scheme: light/);
    assert.match(block, /alt="[^"]+"/);
  }
});

test('renderReadmeHtml switches dark/light SVGs, renders GFM tables, and escapes raw HTML safely', async () => {
  const { renderReadmeHtml } = await import('./markdown.mjs');
  const readme = readFileSync(resolve(ROOT_DIR, 'README.md'), 'utf8');

  const darkHtml = renderReadmeHtml(readme, 'dark');
  const lightHtml = renderReadmeHtml(readme, 'light');

  assert.match(darkHtml, /src="\/assets\/hero-dark\.svg"/);
  assert.match(darkHtml, /src="\/assets\/pipeline-dark\.svg"/);
  assert.match(lightHtml, /src="\/assets\/hero-light\.svg"/);
  assert.match(lightHtml, /src="\/assets\/pipeline-light\.svg"/);
  assert.match(darkHtml, /<table><thead><tr><th>Domain<\/th>/);

  const untrusted = renderReadmeHtml('Hello <script>alert(1)</script> world', 'dark');
  assert.ok(!untrusted.includes('<script>'), 'Raw script tags must be escaped');
  assert.match(untrusted, /&lt;script&gt;/);
});
